/* App.tsx */
import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet, View, useColorScheme, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import MainApp from "./src/navigation/MainApp";
import Preview from "./src/navigation/Preview";


SplashScreen.preventAutoHideAsync().catch(() => {});

const USE_PREVIEW_MODE = false;

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  const [activeWs, setActiveWs] = useState<WebSocket | null>(null);

  // --- 1. FONT LOADING ---
  const [fontsLoaded, fontError] = useFonts({
    aera_black: require("./assets/fonts/aera_black.ttf"),
    aera_heavy: require("./assets/fonts/aera_heavy.ttf"),
    aera_bold: require("./assets/fonts/aera_bold.ttf"),
    aera_medium: require("./assets/fonts/aera_medium.ttf"),
    aera_regular: require("./assets/fonts/aera_regular.ttf"),
    aera_semibold: require("./assets/fonts/aera_semibold.ttf"),
    aera_small: require("./assets/fonts/aera_small.ttf"),
    aera_tiny: require("./assets/fonts/aera_tiny.ttf"),
    aera_tallmedium: require("./assets/fonts/aera_tallmedium.ttf"),
    aera_tallsmall: require("./assets/fonts/aera_tallsmall.ttf"),
    aera_tallcompressed: require("./assets/fonts/aera_tallcompressed.ttf"),
  });

  // --- 2. THEME CONFIGURATION ---
  const barSurfaceColor = isDarkMode ? "#141414" : "#E7E7E7";
  const theme = {
    background: isDarkMode ? "#060606" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
    primaryBlue: isDarkMode ? "#1CA7ED" : "#1497D9",
    boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
    pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
    barSurface: barSurfaceColor,
  };

  // --- WebSocket Connection Engine ---
  useEffect(() => {
    const ESP32_IP = "192.168.18.27"; 
    const wsUrl = `ws://${ESP32_IP}:8080/ws`;

    console.log(`[WS Engine] Attempting link establishment: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[WS Engine] Live connection pipeline verified.");
      setActiveWs(ws);
    };

    ws.onclose = () => {
      console.log("[WS Engine] Network tunnel dropped.");
      setActiveWs(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  // --- 3. ANDROID SYSTEM UI SYNC ---
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    async function syncSystemBars() {
      if (Platform.OS === "android") {
        try {
          await NavigationBar.setBackgroundColorAsync("#00000000");
          await NavigationBar.setPositionAsync("absolute");
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync("overlay-swipe");
        } catch (error) {
          console.warn("Failed to set navigation bar state", error);
        }
      }
    }
    timeoutId = setTimeout(syncSystemBars, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  // --- 4. SPLASH SCREEN LOGIC ---
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View
        style={[styles.container, { backgroundColor: theme.background }]}
        onLayout={onLayoutRootView}
      >
        <StatusBar
          style={isDarkMode ? "light" : "dark"}
          backgroundColor={theme.background}
          translucent={false}
        />

        {USE_PREVIEW_MODE ? (
          <Preview theme={theme} />
        ) : (
          <MainApp theme={theme} ws={activeWs} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});



/* MainScreen.tsx */
/* MainScreen.tsx */
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";
import SystemMonitor from "../components/ui/SystemMonitor";
import TimerCard from "../components/ui/TimerCard";
import QuickActionCard, {
  QuickActionState,
} from "../components/ui/QuickActionCard";
import TimerPickerCard from "../components/ui/TimerPickerCard";
import type { TimerPickerRef } from "../components/ui/TimerPickerCard";
import TemperaturePickerCard from "../components/ui/TemperaturePickerCard";
import type { TemperaturePickerRef } from "../components/ui/TemperaturePickerCard";
import ControlCenter from "../components/ui/ControlCenter";

interface ThemeType {
  background: string;
  text?: string;
  [key: string]: any;
}

interface MainProps {
  theme: ThemeType;
  onLogout?: () => void;
  ws: WebSocket | null; // Accept network property reference from navigation wrapper
}

interface ActiveSessionType {
  title: string;
  initialSeconds: number;
  secondsLeft: number;
  isHrMin: boolean;
}

const KEYBOARD_CONFIG = {
  scrollY: 80,
  offsetIos: 40,
  offsetAndroid: 20,
};

const QUICK_ACTIONS = [
  { id: "1", title: "Quick Dry", time: "00:10", subtitle: "min : sec 50°C" },
  { id: "2", title: "Body Towel", time: "02:30", subtitle: "hr : min 65°C" },
  {
    id: "3",
    title: "Cotton Shirt",
    time: "05:00",
    subtitle: "min : sec 55°C",
  },
];

const INITIAL_DEVICE_STATUS = {
  water: 75 as 0 | 25 | 50 | 75 | 100 | null,
  door: "locked" as "locked" | "unlocked" | "inactive",
  uvActive: true,
  wifiLevel: 3 as 1 | 2 | 3 | 4,
  connectionState: "connected" as "connecting" | "connected" | "offline",
};

const parseTimeToSeconds = (timeStr: string, isHrMin: boolean): number => {
  const [parts1, parts2] = timeStr.split(":").map(Number);
  if (isHrMin) return parts1 * 3600 + parts2 * 60;
  return parts1 * 60 + parts2;
};

const formatSecondsToDisplay = (
  totalSeconds: number,
  isHrMin: boolean,
): string => {
  if (isHrMin) {
    const totalMinutes = Math.ceil(totalSeconds / 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const MainScreen: React.FC<MainProps> = ({ theme, onLogout, ws }) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "timer" | "settings">("dashboard");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSessionType | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [displaySession, setDisplaySession] = useState<ActiveSessionType | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const timerPickerRef = useRef<TimerPickerRef>(null);
  const temperaturePickerRef = useRef<TemperaturePickerRef>(null);

  const isStacked = !!activeSession;
  const stackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(stackAnim, {
      toValue: isStacked ? 1 : 0,
      duration: 380,
      useNativeDriver: false,
    }).start();
  }, [isStacked, stackAnim]);

  useEffect(() => {
    if (activeSession) {
      setDisplaySession(activeSession);
    } else {
      const timeout = setTimeout(() => {
        setDisplaySession(null);
      }, 380);
      return () => clearTimeout(timeout);
    }
  }, [activeSession]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
      if (activeTab === "timer") {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: KEYBOARD_CONFIG.scrollY, animated: true });
        }, 60);
      }
    });

    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [activeTab]);

  // --- Real-time Network Interceptor Hook ---
  useEffect(() => {
    if (!ws) return;

    const handleNetworkMessage = (event: WebSocketMessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.event === "TIMER_SYNC") {
          // STATE_DRYING constant maps directly to 5 from your hardware settings configurations
          if (payload.app_state === 5 && payload.secondsLeft > 0) {
            setActiveSession({
              title: activeSession?.title || "Drying Core",
              initialSeconds: payload.totalSeconds,
              secondsLeft: payload.secondsLeft,
              isHrMin: payload.totalSeconds >= 3600,
            });
            setIsPaused(Boolean(payload.isPaused));
          } else {
            // Hardware dropped to main menu or ended cycle -> Close layout cards
            setActiveSession(null);
          }
        }
      } catch (err) {
        console.warn("Error unpacking sync payload layout contexts.", err);
      }
    };

    ws.addEventListener("message", handleNetworkMessage);
    return () => {
      ws.removeEventListener("message", handleNetworkMessage);
    };
  }, [ws, activeSession]);

  const titlebarMode = useMemo(() => {
    return activeTab === "timer" ? "setup" : activeTab;
  }, [activeTab]);

  // --- Reactive Control Transmission Handlers ---
  const handlePauseToggle = () => {
    if (ws) {
      ws.send(JSON.stringify({
        event: isPaused ? "RESUME_TIMER" : "PAUSE_TIMER"
      }));
    }
  };

  const handleCustomTimerStart = useCallback(() => {
    const timerValues = timerPickerRef.current?.getValues();
    if (!timerValues || !ws) return;

    const { leftVal, rightVal, isMinSec } = timerValues;
    const timeStr = `${leftVal || "00"}:${rightVal || "00"}`;
    const isHrMin = !isMinSec;
    const totalSeconds = parseTimeToSeconds(timeStr, isHrMin);

    if (totalSeconds <= 0) return;

    ws.send(JSON.stringify({
      event: "START_TIMER",
      duration: totalSeconds
    }));

    setActiveTab("dashboard");
  }, [ws]);

  const handleResetTimer = useCallback(() => {
    timerPickerRef.current?.reset();
    temperaturePickerRef.current?.reset();
  }, []);

  const renderContent = () => {
    const timerOpacity = stackAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const timerTranslateY = stackAnim.interpolate({ inputRange: [0, 1], outputRange: [-160, 0] });
    const timerHeight = stackAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });
    const timerMarginBottom = stackAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

    const scrollView = (
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "dashboard" && (
          <View style={styles.page}>
            <View style={styles.monitorContainer}>
              <SystemMonitor theme={theme} />
            </View>

            {displaySession && (
              <Animated.View
                style={{
                  width: "100%",
                  opacity: timerOpacity,
                  height: timerHeight,
                  marginBottom: timerMarginBottom,
                  zIndex: 1, 
                  transform: [{ translateY: timerTranslateY }],
                }}
              >
                <TimerCard
                  theme={theme}
                  time={formatSecondsToDisplay(displaySession.secondsLeft, displaySession.isHrMin)}
                  isHrMin={displaySession.isHrMin}
                  progress={(displaySession.initialSeconds - displaySession.secondsLeft) / displaySession.initialSeconds}
                  percentage={Math.round(((displaySession.initialSeconds - displaySession.secondsLeft) / displaySession.initialSeconds) * 100)}
                  isPaused={isPaused}
                  onPauseToggle={handlePauseToggle}
                  onCancel={() => {
                    if (ws) ws.send(JSON.stringify({ event: "STOP_TIMER" }));
                  }}
                />
              </Animated.View>
            )}

            <View style={styles.quickActionsSection}>
              <Text style={[styles.sectionHeader, { color: theme.text || "#2E2E2E" }]}>
                Quick Actions
              </Text>

              {QUICK_ACTIONS.map((action, index) => {
                let cardState: QuickActionState = "default";
                if (isStacked) {
                  cardState = "disabled";
                } else if (activeActionId === action.id) {
                  cardState = "power_enabled";
                }

                const animatedMarginTop = stackAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, index === 0 ? 0 : -86],
                });

                const animatedMarginBottom = stackAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                });

                return (
                  <Animated.View
                    key={action.id}
                    style={{
                      marginTop: animatedMarginTop,
                      marginBottom: animatedMarginBottom,
                      zIndex: QUICK_ACTIONS.length - index,
                    }}
                  >
                    <QuickActionCard
                      theme={theme}
                      title={action.title}
                      time={action.time}
                      subtitle={action.subtitle}
                      state={cardState}
                      onCardPress={() => setActiveActionId((prev) => (prev === action.id ? null : action.id))}
                      onPowerPress={() => {
                        const isHrMinFormat = action.subtitle.includes("hr : min");
                        const totalSeconds = parseTimeToSeconds(action.time, isHrMinFormat);

                        if (ws && totalSeconds > 0) {
                          ws.send(JSON.stringify({
                            event: "START_TIMER",
                            duration: totalSeconds
                          }));
                        }
                      }}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === "timer" && (
          <View style={styles.timerPageContainer}>
            <TimerPickerCard ref={timerPickerRef} theme={theme} />
            <TemperaturePickerCard ref={temperaturePickerRef} theme={theme} />
          </View>
        )}
      </ScrollView>
    );

    if (activeTab === "timer") {
      return (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? KEYBOARD_CONFIG.offsetIos : KEYBOARD_CONFIG.offsetAndroid}
        >
          {scrollView}
        </KeyboardAvoidingView>
      );
    }

    return <View style={styles.flex}>{scrollView}</View>;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <AeraStatusBar theme={theme} status={INITIAL_DEVICE_STATUS} />
        <AeraTitlebar
          mode={titlebarMode}
          theme={theme}
          status={INITIAL_DEVICE_STATUS.connectionState}
          onPresetPress={() => console.log("Preset Menu Pressed")}
        />
      </View>

      {renderContent()}

      <View style={styles.footer}>
        {activeTab === "timer" && (
          <View style={styles.controlCenterContainer}>
            <ControlCenter
              theme={theme}
              onPowerPress={handleCustomTimerStart}
              onResetPress={handleResetTimer}
              onBookmarkPress={(isBookmarked) => console.log(`Bookmark ${isBookmarked ? "saved" : "removed"}`)}
            />
          </View>
        )}
        <NavigationBar theme={theme} activeTab={activeTab} onTabChange={(tab: any) => setActiveTab(tab)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerContainer: { zIndex: 10 },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 220,
  },
  page: { width: "100%", alignItems: "center" },
  timerPageContainer: { width: "100%", alignItems: "center", gap: 10 },
  monitorContainer: { width: "100%", zIndex: 5, elevation: 5, marginBottom: 10 },
  quickActionsSection: { width: "100%", marginTop: 10 },
  sectionHeader: { fontFamily: "aera_heavy", fontSize: 22, alignSelf: "flex-start", paddingLeft: 4, marginBottom: 10 },
  footer: { position: "absolute", bottom: 0, width: "100%", zIndex: 20, elevation: 20, flexDirection: "column", justifyContent: "flex-end" },
  controlCenterContainer: { width: "100%", marginBottom: 0, paddingBottom: 0 },
});

export default MainScreen;

import React, { useState } from "react";
import Setup from "./Setup";
import MainScreen from "../screens/MainScreen";

const SKIP_SETUP = true;

interface MainAppProps {
  theme: any; 
  ws: WebSocket | null; 
}

export default function MainApp({ theme, ws }: MainAppProps) {
  const [isSetupComplete, setIsSetupComplete] = useState(SKIP_SETUP);

  return isSetupComplete ? (
    <MainScreen 
      theme={theme} 
      onLogout={() => setIsSetupComplete(false)} 
      ws={ws} 
    />
  ) : (
    <Setup theme={theme} onComplete={() => setIsSetupComplete(true)} />
  );
}



import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import ResetIcon from "../components/icons/ResetIcon";
import BookmarkIcon from "../components/icons/BookmarkIcon";

export default function Preview({ theme }: { theme: any }) {
	const isDarkMode =
		theme.background === "#000000" || theme.background === "#1a1a1a";

	return (
		<ScrollView
			contentContainerStyle={[
				styles.content,
				{ backgroundColor: theme.background },
			]}
			keyboardShouldPersistTaps="handled"
		>
			{/* Reset Icon Preview Block */}
			<View style={styles.block}>
				<Text style={[styles.label, { color: theme.text }]}>
					Reset Icon
				</Text>
				<View style={styles.iconRow}>
					<View style={styles.iconContainer}>
						<ResetIcon darkMode={isDarkMode} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Normal
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<ResetIcon darkMode={isDarkMode} disabled={true} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Disabled
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<ResetIcon fill="#FF6B6B" />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Custom
						</Text>
					</View>
				</View>
			</View>

			{/* Bookmark Icon Preview Block */}
			<View style={styles.block}>
				<Text style={[styles.label, { color: theme.text }]}>
					Bookmark Icon
				</Text>
				<View style={styles.iconRow}>
					<View style={styles.iconContainer}>
						<BookmarkIcon darkMode={isDarkMode} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Fill
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<BookmarkIcon darkMode={isDarkMode} outline={true} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Outline
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<BookmarkIcon fill="#FF6B6B" />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Custom Fill
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<BookmarkIcon outline={true} fill="#4CAF50" />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Custom Outline
						</Text>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: 20,
		paddingVertical: 40,
		backgroundColor: "transparent",
		gap: 40,
	},
	block: {
		gap: 16,
		width: "100%",
		alignItems: "center",
	},
	label: {
		fontFamily: "aera_semibold",
		fontSize: 14,
		opacity: 0.6,
		textTransform: "uppercase",
		textAlign: "center",
	},
	iconRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 24,
		marginTop: 8,
	},
	iconContainer: {
		alignItems: "center",
		gap: 8,
	},
	iconLabel: {
		fontFamily: "aera_regular",
		fontSize: 12,
		opacity: 0.7,
	},
});


## Ui Component

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import ChamberTempIcon from "../icons/ChamberTempIcon";
import HeaterTempIcon from "../icons/HeaterTempIcon";
import RelativeHumidityIcon from "../icons/RelativeHumidityIcon";
import FanSpeedMonitorIcon from "../icons/FanSpeedMonitorIcon";

interface Props {
  theme: any;
}

const SystemMonitor: React.FC<Props> = ({ theme }) => {
  const isDarkMode = theme.background === "#060606";
  const textColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";

  const [data, setData] = useState({ temp: 20, humidity: 0, fan: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        temp: Math.floor(Math.random() * (70 - 20 + 1)) + 20,
        humidity: Math.floor(Math.random() * 101),
        fan: Math.floor(Math.random() * 101),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      key={isDarkMode ? "monitor-dark" : "monitor-light"}
      style={[
        styles.base,
        { backgroundColor: isDarkMode ? "#141414" : "#E7E7E7" },
        isDarkMode && styles.darkBorder,
      ]}
    >
      <View style={styles.grid}>
        
        {/* TOP LEFT: CHAMBER TEMP */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Chamber Temp (°C)</Text>
            <ChamberTempIcon fill={textColor} width={8} height={16} />
          </View>
          <Text style={[styles.mainValue, { color: textColor }]}>{data.temp}°</Text>
        </View>

        {/* TOP RIGHT: HEATER TEMP */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Heater Temp (°C)</Text>
            <HeaterTempIcon fill={textColor} width={15} height={16} />
          </View>
          <Text style={[styles.mainValue, { color: textColor }]}>{data.temp}°</Text>
        </View>

        {/* BOTTOM LEFT: HUMIDITY */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Relative Humidity</Text>
            <RelativeHumidityIcon fill={textColor} width={12} height={16} />
          </View>
          <Text style={[styles.mainValue, { color: textColor }]}>{data.humidity}%</Text>
        </View>

        {/* BOTTOM RIGHT: FAN SPEED */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Fan Speed</Text>
            <FanSpeedMonitorIcon fill={textColor} width={18} height={15} />
          </View>
          
          {/* THE FIX: These rows now combine to exactly 60px height to match the Humidity text */}
          <View style={styles.fanRow}>
            <Text style={[styles.fanLabel, { color: textColor }]}>Intake</Text>
            <Text style={[styles.fanValue, { color: textColor }]}>{data.fan}%</Text>
          </View>
          
          <View style={styles.fanRow}>
            <Text style={[styles.fanLabel, { color: textColor }]}>Exhaust</Text>
            <Text style={[styles.fanValue, { color: textColor }]}>{data.fan}%</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    paddingInline: 20,
    paddingBlock: 10,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cell: {
    width: "48%",
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 18, // Lock header height for better alignment
  },
  headerText: {
    fontFamily: "aera_bold",
    fontSize: 11,
  },
  mainValue: {
    fontFamily: "aera_small",
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: -1,
  },
  fanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30, // 30 + 30 = 60 (Matches Humidity lineHeight)
  },
  fanLabel: {
    fontFamily: "aera_medium",
    fontSize: 16,
    lineHeight: 30,
  },
  fanValue: {
    fontFamily: "aera_tiny",
    fontSize: 26,
    lineHeight: 30,
  },
});

export default SystemMonitor;

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import PowerButtonIcon from "../icons/PowerButtonIcon";

export type QuickActionState =
  | "default"
  | "power_enabled"
  | "power_disabled"
  | "disabled";

interface Props {
  theme: any;
  state?: QuickActionState;
  title?: string;
  time?: string;
  subtitle?: string;
  onPowerPress?: () => void;
  onCardPress?: () => void;
}

const QuickActionCard: React.FC<Props> = ({
  theme,
  state = "default",
  title = "Quick Dry",
  time = "20:05",
  subtitle = "min : sec 50°C",
  onPowerPress,
  onCardPress,
}) => {
  const isDarkMode = theme.background === "#060606";
  const isFullyDisabled = state === "disabled";
  const isPowerVisible = state === "power_enabled" || state === "power_disabled";

  // --- Animation Logic ---
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isPowerVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [state, isPowerVisible, slideAnim]);

  const cardRightOffset = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const cardRightRadius = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 10],
  });

  // --- Theme Mapping ---
  const topBgColor = isDarkMode ? "#141414" : "#E7E7E7";
  const defaultTextColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";
  
  const disabledTextColor = isDarkMode
    ? "rgba(161, 161, 161, 0.75)"
    : "rgba(54, 54, 54, 0.50)";
    
  const textColor = isFullyDisabled ? disabledTextColor : defaultTextColor;
  const powerBgColor = isDarkMode ? "#E7E7E7" : "#D52222";

  const iconFill =
    state === "power_enabled"
      ? isDarkMode
        ? "#D52222"
        : "#fff"
      : isDarkMode
        ? "rgba(161, 161, 161, 0.75)"
        : "rgba(54, 54, 54, 0.50)";

  return (
    <View
      style={styles.container}
      key={isDarkMode ? "quickaction-dark" : "quickaction-light"}
    >
      {/* LAYER 1 (BOTTOM) */}
      <View style={[styles.powerButtonBase, { backgroundColor: powerBgColor }]}>
        <View style={styles.powerPressableArea}>
          <Pressable
            style={styles.powerPressable}
            onPress={onPowerPress}
            disabled={state === "power_disabled" || isFullyDisabled}
          >
            <PowerButtonIcon
              fill={iconFill}
              width={28}
              height={30}
            />
          </Pressable>
        </View>
      </View>

      {/* LAYER 2 (TOP) */}
      <Animated.View
        style={[
          styles.mainCard,
          {
            backgroundColor: topBgColor,
            right: cardRightOffset,
            borderTopRightRadius: cardRightRadius,
            borderBottomRightRadius: cardRightRadius,
          },
          isDarkMode && styles.darkBorder,
        ]}
      >
        <Pressable
          style={styles.cardPressable}
          onPress={onCardPress}
          disabled={isFullyDisabled}
        >
          <Text
            style={[styles.titleText, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={styles.statsContainer}>
            <Text style={[styles.timeText, { color: textColor }]}>
              {time}
            </Text>
            <Text style={[styles.subtitleText, { color: textColor }]}>
              {subtitle}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 94,
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  powerButtonBase: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  powerPressableArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
  },
  powerPressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCard: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
  },
  cardPressable: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titleText: {
    fontFamily: "aera_bold",
    fontSize: 18,
    flexShrink: 1,
    paddingRight: 10,
  },
  statsContainer: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  timeText: {
    fontFamily: "aera_tallcompressed",
    fontSize: 48,
    lineHeight: 34,
    includeFontPadding: false,
  },
  subtitleText: {
    fontFamily: "aera_medium",
    fontSize: 12,
    lineHeight: 21,
    includeFontPadding: false,
  },
});

export default QuickActionCard;

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

interface Props {
  theme: any;
}

export interface TemperaturePickerRef {
  getValue: () => number;
  reset: () => void;
}

const DecreaseIcon = ({
  bgFill,
  iconFill,
}: {
  bgFill: string;
  iconFill: string;
}) => (
  <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
    <Rect x={11} y={7} width={50} height={50} rx={20} fill={bgFill} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26 32C26 30.8954 26.6396 30 27.4286 30L44.5714 30C45.3604 30 46 30.8954 46 32C46 33.1046 45.3604 34 44.5714 34L27.4286 34C26.6396 34 26 33.1046 26 32Z"
      fill={iconFill}
    />
  </Svg>
);

const IncreaseIcon = ({
  bgFill,
  iconFill,
}: {
  bgFill: string;
  iconFill: string;
}) => (
  <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
    <Rect x={11} y={7} width={50} height={50} rx={20} fill={bgFill} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M36 22C36.789 22 37.4286 22.6396 37.4286 23.4286V30.5714H44.5714C45.3604 30.5714 46 31.211 46 32C46 32.789 45.3604 33.4286 44.5714 33.4286H37.4286V40.5714C37.4286 41.3604 36.789 42 36 42C35.211 42 34.5714 41.3604 34.5714 40.5714V33.4286H27.4286C26.6396 33.4286 26 32.789 26 32C26 31.211 26.6396 30.5714 27.4286 30.5714L34.5714 30.5714V23.4286C34.5714 22.6396 35.211 22 36 22Z"
      fill={iconFill}
    />
  </Svg>
);

const TemperaturePickerCard = forwardRef<TemperaturePickerRef, Props>(({ theme }, ref) => {
  const isDarkMode = theme?.background === "#060606";

  const [tempVal, setTempVal] = useState("20");
  const [isFocused, setIsFocused] = useState(false);

  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return parseInt(tempVal, 10) || 50;
    },
    reset: () => {
      setTempVal("20");
    },
  }), [tempVal]);

  const baseBg = isDarkMode ? "#141414" : "#E7E7E7";
  const focalBg = isDarkMode ? "#E7E7E7" : "#2E2E2E";
  const titleColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";
  const activeNumberColor = isDarkMode ? "#2E2E2E" : "#FFFFFF";

  useEffect(() => {
    return () => stopHoldAction();
  }, []);

  const decrementValue = () => {
    setTempVal((prev) => {
      const currentTemp = parseInt(prev || "0", 10);
      if (currentTemp > 20) return String(currentTemp - 1);
      return "20";
    });
  };

  const incrementValue = () => {
    setTempVal((prev) => {
      const currentTemp = parseInt(prev || "0", 10);
      if (currentTemp < 100) return String(currentTemp + 1);
      return "100";
    });
  };

  const startHoldingDecrease = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(decrementValue, 50);
  };

  const startHoldingIncrease = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(incrementValue, 50);
  };

  const stopHoldAction = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleTempChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const num = parseInt(digits, 10) || 0;

    if (num === 0 && digits === "") {
      setTempVal("");
      return;
    }

    if (num > 100) {
      setTempVal("100");
    } else {
      setTempVal(num.toString());
    }
  };

  const handleFocus = (val: string, setter: (val: string) => void) => {
    const num = parseInt(val, 10) || 0;
    if (num === 0) {
      setter("");
    } else {
      setter(num.toString());
    }
  };

  const handleBlur = (val: string, setter: (val: string) => void) => {
    const num = parseInt(val, 10) || 0;

    if (num < 20) {
      setter("20");
    } else if (num > 100) {
      setter("100");
    } else {
      setter(num.toString());
    }
  };

  const getDisplayText = (val: string) => {
    if (val === "") {
      return "20";
    }
    return val;
  };

  return (
    <View
      style={[
        styles.baseCard,
        { backgroundColor: baseBg },
        isDarkMode && styles.darkBorder,
      ]}
      key={isDarkMode ? "temppicker-dark" : "temppicker-light"}
    >
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: titleColor }]}>
          Set Heat (°C)
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <Pressable
          onPress={decrementValue}
          onLongPress={startHoldingDecrease}
          onPressOut={stopHoldAction}
          delayLongPress={300}
          style={styles.controlButton}
        >
          <DecreaseIcon
            bgFill={focalBg}
            iconFill={activeNumberColor}
          />
        </Pressable>

        <View style={[styles.focalBox, { backgroundColor: focalBg }]}>
          <View style={styles.inputWrapper}>
            <Text
              style={[
                styles.mainNumberInput,
                styles.visibleDisplay,
                { color: activeNumberColor },
              ]}
            >
              {getDisplayText(tempVal)}
            </Text>

            <TextInput
              style={[
                styles.mainNumberInput,
                styles.hiddenInput,
                { color: "transparent", opacity: 0 },
              ]}
              value={tempVal}
              onChangeText={handleTempChange}
              onFocus={() => {
                handleFocus(tempVal, setTempVal);
                setIsFocused(true);
              }}
              onBlur={() => {
                handleBlur(tempVal, setTempVal);
                setIsFocused(false);
              }}
              keyboardType="number-pad"
              selectTextOnFocus={true}
              autoCorrect={false}
              spellCheck={false}
              scrollEnabled={false}
              multiline={false}
              maxLength={3}
              caretHidden={true}
              selectionColor="transparent"
            />
          </View>
        </View>

        <Pressable
          onPress={incrementValue}
          onLongPress={startHoldingIncrease}
          onPressOut={stopHoldAction}
          delayLongPress={300}
          style={styles.controlButton}
        >
          <IncreaseIcon
            bgFill={focalBg}
            iconFill={activeNumberColor}
          />
        </Pressable>
      </View>
    </View>
  );
});

TemperaturePickerCard.displayName = 'TemperaturePickerCard';

const styles = StyleSheet.create({
  baseCard: {
    width: "100%",
    height: 217.27,
    borderRadius: 20,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  titleContainer: {
    height: 48,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  focalBox: {
    minWidth: 140,
    paddingHorizontal: 10,
    height: 165,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  inputWrapper: {
    height: 160,
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  visibleDisplay: {
    pointerEvents: "none",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontFamily: "aera_heavy",
    fontSize: 16,
    lineHeight: 21,
    includeFontPadding: false,
    paddingBottom: 15,
  },
  mainNumberInput: {
    fontFamily: "aera_tallcompressed",
    fontSize: 140,
    lineHeight: 140,
    height: 140,
    minWidth: 120,
    textAlignVertical: "center",
    includeFontPadding: false,
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
});

export default TemperaturePickerCard;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PausePlayButton from "./PausePlayButton";
import CancelButton from "./CancelButton";
import ProgressBar from "./ProgressBar";
import ActiveDryingSunIcon from "../icons/ActiveDryingSunIcon";

interface Props {
	theme: any;
	time: string;
	isHrMin: boolean;
	progress: number;
	percentage: number;
	onCancel: () => void;
	isPaused: boolean;
	onPauseToggle: () => void;
}

const TimerCard: React.FC<Props> = ({
	theme,
	time,
	isHrMin,
	progress,
	percentage,
	onCancel,
	isPaused,
	onPauseToggle,
}) => {
	const isDarkMode = theme.background === "#060606";
	const textColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";

	return (
		<View
			key={isDarkMode ? "timer-dark" : "timer-light"}
			style={[
				styles.base,
				{ backgroundColor: isDarkMode ? "#141414" : "#E7E7E7" },
				isDarkMode && styles.darkBorder,
			]}
		>
			{/* THE OVERLAY BOX (Top Section) */}
			<View
				style={[
					styles.overlay,
					{ backgroundColor: isDarkMode ? "#141414" : "#E7E7E7" },
					isDarkMode && styles.darkBorder,
				]}
			>
				{/* LEFT COLUMN: Title, Progress, Stats */}
				<View style={styles.leftColumn}>
					<Text
						style={[styles.titleText, { color: textColor }]}
						numberOfLines={1}
					>
						Now Drying
					</Text>

					<View style={styles.progressContainer}>
						{/* FIXED: Passing percentage (0-100) instead of decimal progress to match ProgressBar's expected scale */}
						<ProgressBar
							theme={theme}
							progress={percentage}
							height={4}
						/>
					</View>

					<View style={styles.statsRow}>
						<View style={styles.sunIconWrapper}>
							<ActiveDryingSunIcon
								fill={textColor}
								width={38}
								height={25}
							/>
						</View>
						<View style={styles.percentContainer}>
							{/* Displays live numerical completion percentage */}
							<Text
								style={[
									styles.percentText,
									{ color: textColor },
								]}
							>
								{percentage}%
							</Text>
							<Text
								style={[styles.unitText, { color: textColor }]}
							>
								{isHrMin ? "hr : min" : "min : sec"}
							</Text>
						</View>
					</View>
				</View>

				{/* RIGHT COLUMN: Giant Timer */}
				<View style={styles.rightColumn}>
					<Text style={[styles.timerText, { color: textColor }]}>
						{time}
					</Text>
				</View>
			</View>

			{/* BOTTOM SECTION (Button Area) */}
			<View style={styles.bottomArea}>
				<PausePlayButton isPaused={isPaused} onPress={onPauseToggle} />
				<CancelButton onPress={onCancel} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	base: {
		width: "100%",
		minHeight: 170,
		borderRadius: 20,
		backgroundColor: "#E7E7E7", // Fallback, will be overridden by your inline styles
		elevation: 6, // Slightly reduced to soften the Android shadow
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 }, // Added proper iOS/Cross-platform rendering
		shadowOpacity: 0.12,
		shadowRadius: 12,
	},
	overlay: {
		width: "100%",
		minHeight: 110,
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		borderBottomRightRadius: 20,
		borderBottomLeftRadius: 20,
		elevation: 3, // Lowered inner elevation so it layers nicely over the base
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 12,
		alignItems: "center",
	},
	darkBorder: { borderWidth: 1, borderColor: "rgba(217, 217, 217, 0.50)" },
	leftColumn: { flex: 1, paddingRight: 15 },
	titleText: { fontFamily: "aera_bold", fontSize: 21, marginBottom: 4 },
	progressContainer: { marginBottom: 2 },
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	percentContainer: { alignItems: "flex-end" },
	percentText: { fontFamily: "aera_tallsmall", fontSize: 28, lineHeight: 22 },
	sunIconWrapper: { transform: [{ translateY: -4 }] },
	unitText: { fontFamily: "aera_medium", fontSize: 12, opacity: 0.8 },
	rightColumn: { justifyContent: "center", alignItems: "flex-end" },
	timerText: {
		fontFamily: "aera_tallmedium",
		fontSize: 100,
		lineHeight: 75,
		letterSpacing: -1,
	},
	bottomArea: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 14,
	},
});

export default TimerCard;


import React, { useState, forwardRef, useImperativeHandle } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
	theme: any;
}

export interface TimerPickerRef {
  getValues: () => { leftVal: string; rightVal: string; isMinSec: boolean } | null;
  reset: () => void;
}

const LeftArrow = ({ fill }: { fill: string }) => (
	<Svg width={4} height={7} viewBox="0 0 4 7" fill="none">
		<Path
			d="M1.174 3.23 3.58.825a.486.486 0 0 0-.687-.688l-2.75 2.75a.486.486 0 0 0 0 .688l2.75 2.75a.486.486 0 0 0 .687-.687z"
			fill={fill}
		/>
	</Svg>
);

const RightArrow = ({ fill }: { fill: string }) => (
	<Svg width={4} height={7} viewBox="0 0 4 7" fill="none">
		<Path
			d="M2.543 3.231.136 5.638a.486.486 0 0 0 .688.687l2.75-2.75a.486.486 0 0 0 0-.688L.825.137a.486.486 0 0 0-.688.687z"
			fill={fill}
		/>
	</Svg>
);

const TimerPickerCard = forwardRef<TimerPickerRef, Props>(({ theme }, ref) => {
	const isDarkMode = theme?.background === "#060606";

	const [leftVal, setLeftVal] = useState("");
	const [rightVal, setRightVal] = useState("");
	const [isMinSec, setIsMinSec] = useState(true);

	const [focusedField, setFocusedField] = useState<"left" | "right" | null>(
		null,
	);

	useImperativeHandle(ref, () => ({
    getValues: () => {
      return {
        leftVal: leftVal || "00",
        rightVal: rightVal || "00",
        isMinSec,
      };
    },
    reset: () => {
      setLeftVal("");
      setRightVal("");
      setIsMinSec(true);
    },
  }), [leftVal, rightVal, isMinSec]);

	const baseBg = isDarkMode ? "#141414" : "#E7E7E7";
	const focalBg = isDarkMode ? "#E7E7E7" : "#2E2E2E";
	const titleColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";
	const activeNumberColor = isDarkMode ? "#2E2E2E" : "#FFFFFF";

	const handleFormatToggle = () => {
		const currentLeft = parseInt(leftVal, 10) || 0;
		const currentRight = parseInt(rightVal, 10) || 0;

		const formatForState = (n: number) =>
			n === 0 ? "" : String(n).padStart(2, "0");

		if (isMinSec) {
			const totalMinutes = currentLeft;
			let hours = Math.floor(totalMinutes / 60);
			let minutes = totalMinutes % 60;

			if (hours >= 12) {
				hours = 12;
				minutes = 0;
			}

			setLeftVal(formatForState(hours));
			setRightVal(formatForState(minutes));
			setIsMinSec(false);
		} else {
			const totalMinutes = currentLeft * 60 + currentRight;
			let minutes = totalMinutes;
			let seconds = 0;

			if (minutes > 60) {
				minutes = 60;
				seconds = 0;
			}

			setLeftVal(formatForState(minutes));
			setRightVal(formatForState(seconds));
			setIsMinSec(true);
		}
	};

	const handleLeftChange = (text: string) => {
		const digits = text.replace(/[^0-9]/g, "");
		const num = parseInt(digits, 10) || 0;

		if (num === 0) {
			setLeftVal("");
			return;
		}

		if (isMinSec) {
			if (num >= 60) {
				let hours = Math.floor(num / 60);
				let minutes = num % 60;
				if (hours >= 12) {
					hours = 12;
					minutes = 0;
				}
				setLeftVal(String(hours).padStart(2, "0"));
				setRightVal(
					minutes === 0 ? "" : String(minutes).padStart(2, "0"),
				);
				setIsMinSec(false);
			} else {
				setLeftVal(num.toString());
			}
		} else {
			if (num >= 12) {
				setLeftVal("12");
				setRightVal("");
			} else {
				setLeftVal(num.toString());
			}
		}
	};

	const handleRightChange = (text: string) => {
		const digits = text.replace(/[^0-9]/g, "");
		const num = parseInt(digits, 10) || 0;
		const leftParsed = parseInt(leftVal, 10) || 0;

		if (num === 0) {
			setRightVal("");
			return;
		}

		if (isMinSec) {
			if (num >= 60) {
				const additionalMinutes = Math.floor(num / 60);
				const remainingSeconds = num % 60;
				const totalMinutes = leftParsed + additionalMinutes;

				if (totalMinutes >= 60) {
					let hours = Math.floor(totalMinutes / 60);
					let minutes = totalMinutes % 60;
					if (hours >= 12) {
						hours = 12;
						minutes = 0;
					}
					setLeftVal(String(hours).padStart(2, "0"));
					setRightVal(
						minutes === 0 ? "" : String(minutes).padStart(2, "0"),
					);
					setIsMinSec(false);
				} else {
					setLeftVal(String(totalMinutes).padStart(2, "0"));
					setRightVal(
						remainingSeconds === 0
							? ""
							: String(remainingSeconds).padStart(2, "0"),
					);
				}
			} else {
				setRightVal(num.toString());
			}
		} else {
			if (num >= 60) {
				const additionalHours = Math.floor(num / 60);
				const remainingMinutes = num % 60;
				let totalHours = leftParsed + additionalHours;

				if (totalHours >= 12) {
					setLeftVal("12");
					setRightVal("");
				} else {
					setLeftVal(String(totalHours).padStart(2, "0"));
					setRightVal(
						remainingMinutes === 0
							? ""
							: String(remainingMinutes).padStart(2, "0"),
					);
				}
			} else {
				setRightVal(num.toString());
			}
		}
	};

	const handleBlur = (val: string, setter: (val: string) => void) => {
		const num = parseInt(val, 10) || 0;
		if (num === 0) {
			setter("");
		} else {
			setter(String(num).padStart(2, "0"));
		}
	};

	const getDisplayText = (val: string) => {
		if (val === "") {
			return "00";
		}
		return val;
	};

	return (
		<View
			style={[
				styles.baseCard,
				{ backgroundColor: baseBg },
				isDarkMode && styles.darkBorder,
			]}
			key={isDarkMode ? "timerpicker-dark" : "timerpicker-light"}
		>
			<View style={styles.titleContainer}>
				<Text style={[styles.title, { color: titleColor }]}>
					Set Timer
				</Text>
			</View>

			<View style={[styles.focalBox, { backgroundColor: focalBg }]}>
				<View style={styles.inputWrapper}>
					<Text
						style={[
							styles.mainNumberInput,
							styles.visibleDisplay,
							{
								color: activeNumberColor,
								opacity: focusedField === "right" ? 0.3 : 1,
							},
						]}
					>
						{getDisplayText(leftVal)}
					</Text>

					<TextInput
						style={[
							styles.mainNumberInput,
							{ color: "transparent" },
						]}
						value={leftVal}
						onChangeText={handleLeftChange}
						onFocus={() => {
							setFocusedField("left");
						}}
						onBlur={() => {
							handleBlur(leftVal, setLeftVal);
							setFocusedField(null);
						}}
						keyboardType="number-pad"
						selectTextOnFocus={true}
						autoCorrect={false}
						spellCheck={false}
						scrollEnabled={false}
						multiline={false}
						maxLength={2}
						caretHidden={true}
						selectionColor="transparent"
					/>
				</View>

				<Text
					style={[
						styles.colonText,
						{
							color: activeNumberColor,
							opacity: focusedField ? 0.3 : 1,
						},
					]}
				>
					:
				</Text>

				<View style={styles.inputWrapper}>
					<Text
						style={[
							styles.mainNumberInput,
							styles.visibleDisplay,
							{
								color: activeNumberColor,
								opacity: focusedField === "left" ? 0.3 : 1,
							},
						]}
					>
						{getDisplayText(rightVal)}
					</Text>

					<TextInput
						style={[
							styles.mainNumberInput,
							{ color: "transparent" },
						]}
						value={rightVal}
						onChangeText={handleRightChange}
						onFocus={() => {
							setFocusedField("right");
						}}
						onBlur={() => {
							handleBlur(rightVal, setRightVal);
							setFocusedField(null);
						}}
						keyboardType="number-pad"
						selectTextOnFocus={true}
						autoCorrect={false}
						spellCheck={false}
						scrollEnabled={false}
						multiline={false}
						maxLength={2}
						caretHidden={true}
						selectionColor="transparent"
					/>
				</View>
			</View>

			<View style={styles.footerContainer}>
				<Pressable
					style={styles.footerToggleRow}
					onPress={handleFormatToggle}
				>
					<LeftArrow fill={titleColor} />
					<Text style={[styles.formatText, { color: titleColor }]}>
						{isMinSec ? "min : sec" : "hr : min"}
					</Text>
					<RightArrow fill={titleColor} />
				</Pressable>
			</View>
		</View>
	);
});

TimerPickerCard.displayName = 'TimerPickerCard';

const styles = StyleSheet.create({
	baseCard: {
		width: "100%",
		height: 217.27,
		borderRadius: 20,
		paddingHorizontal: 28,
		elevation: 8,
		shadowColor: "#000",
	},
	darkBorder: {
		borderWidth: 1,
		borderColor: "rgba(217, 217, 217, 0.50)",
	},
	titleContainer: {
		height: 58,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 14,
	},
	focalBox: {
		width: "100%",
		height: 114.69,
		borderRadius: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
		elevation: 4,
		shadowColor: "#000",
	},
	inputWrapper: {
		height: 100,
		width: 105,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	visibleDisplay: {
		position: "absolute",
		zIndex: 1,
		pointerEvents: "none",
	},
	footerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 4,
	},
	title: {
		fontFamily: "aera_heavy",
		fontSize: 16,
		lineHeight: 21,
		includeFontPadding: false,
	},
	mainNumberInput: {
		fontFamily: "aera_tallcompressed",
		fontSize: 100,
		lineHeight: 100,
		height: 100,
		width: 105,
		textAlignVertical: "center",
		includeFontPadding: false,
		textAlign: "center",
		padding: 0,
		margin: 0,
	},
	colonText: {
		fontFamily: "aera_tallcompressed",
		fontSize: 100,
		lineHeight: 100,
		includeFontPadding: false,
		textAlign: "center",
		paddingBottom: 14,
	},
	footerToggleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	formatText: {
		fontFamily: "aera_bold",
		fontSize: 16,
		lineHeight: 21,
		includeFontPadding: false,
		textAlign: "center",
	},
});

export default TimerPickerCard;

import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
	theme: any;
	progress: number; // Expects a value from 0 to 100
	height?: number;
}

const ProgressBar: React.FC<Props> = ({ theme, progress, height = 4 }) => {
	const isDarkMode = theme.background === "#060606";

	// Ensure the progress value stays safely within 0 and 100
	const clampedProgress = Math.max(0, Math.min(100, progress));

	return (
		// ProgressBarBg
		<View style={[styles.bg, { height }]}>
			{/* ProgressBar (Active fill) */}
			<View
				style={[
					styles.fill,
					{
						width: `${clampedProgress}%`,
						backgroundColor: isDarkMode ? "#E7E7E7" : "#2E2E2E",
					},
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	bg: {
		width: "100%",
		backgroundColor: "rgba(161, 161, 161, 0.75)",
		borderRadius: 20,
		// Prevents the inner square corners from breaking out of the rounded background
		overflow: "hidden",
	},
	fill: {
		height: "100%",
		borderRadius: 20,
	},
});

export default ProgressBar;

import React from "react"; // Removed useState since state is now handled globally
import { Pressable, Text, StyleSheet, View } from "react-native";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";

interface Props {
  disabled?: boolean;
  isPaused: boolean;     // Added: Drives the button's layout structure
  onPress: () => void;   // Added: Fires when the button is tapped
}

const PausePlayButton: React.FC<Props> = ({ 
  disabled = false, 
  isPaused, 
  onPress 
}) => {
  // Switch content color based on the disabled state
  const contentColor = disabled ? "rgba(54, 54, 54, 0.5)" : "#2E2E2E";

  return (
    <Pressable
      onPress={onPress} // Directly triggers the pause engine handler passed from MainScreen
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <View style={styles.iconContainer}>
        {/* If the timer is paused, display the Play icon to let them resume */}
        {isPaused ? (
          <PlayIcon fill={contentColor} width={14} height={16} />
        ) : (
          <PauseIcon fill={contentColor} width={12} height={16} />
        )}
      </View>
      
      <Text style={[styles.label, { color: contentColor }]}>
        {isPaused ? "Continue Drying" : "Pause Drying"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6B91E",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 100,
    elevation: 6,
    shadowColor: "#000",
  },
  buttonPressed: {
    opacity: 0.8,
    elevation: 2, 
  },
  buttonDisabled: {
    elevation: 1,
  },
  iconContainer: {
    width: 16, 
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  label: {
    fontFamily: "aera_medium",
    fontSize: 12,
  },
});

export default PausePlayButton;

import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavProps {
	activeTab: "dashboard" | "timer" | "settings";
	onTabChange: (tab: "dashboard" | "timer" | "settings") => void;
	theme: any;
}

const NavigationBar: React.FC<NavProps> = ({
	activeTab,
	onTabChange,
	theme,
}) => {
	const insets = useSafeAreaInsets();
	const isDarkMode = theme.background === "#060606";

	const activeColor = isDarkMode ? "#1CA7ED" : "#1497D9";
	const inactiveColor = isDarkMode
		? "rgba(161, 161, 161, 0.75)"
		: "rgba(54, 54, 54, 0.50)";
	const bgColor = isDarkMode ? "#141414" : "#E7E7E7";

	return (
		<View
			style={[
				styles.navContainer,
				{
					backgroundColor: bgColor,
					// 1. Calculate total height: Base height (56) + System Insets
					// 2. Padding bottom ensures content stays above the system gesture/button bar
					height: 56 + insets.bottom,
					paddingBottom: insets.bottom,
				},
				isDarkMode ? styles.darkBorder : styles.lightShadow,
			]}
		>
			{/* DASHBOARD */}
			<TouchableOpacity
				style={styles.tab}
				onPress={() => onTabChange("dashboard")}
			>
				<Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<Path
						d="M10.6118 0.356964C10.1358 -0.118988 9.36416 -0.118988 8.88821 0.356964L0.356964 8.88821C-0.118988 9.36416 -0.118988 10.1358 0.356964 10.6118C0.832915 11.0877 1.60458 11.0877 2.08054 10.6118L2.4375 10.2548V18.2812C2.4375 18.9543 2.98315 19.5 3.65625 19.5H6.09375C6.76685 19.5 7.3125 18.9543 7.3125 18.2812V15.8437C7.3125 15.1707 7.85815 14.625 8.53125 14.625H10.9688C11.6418 14.625 12.1875 15.1707 12.1875 15.8437V18.2812C12.1875 18.9543 12.7332 19.5 13.4062 19.5H15.8437C16.5168 19.5 17.0625 18.9543 17.0625 18.2812V10.2548L17.4195 10.6118C17.8954 11.0877 18.6671 11.0877 19.143 10.6118C19.619 10.1358 19.619 9.36416 19.143 8.88821L10.6118 0.356964Z"
						fill={
							activeTab === "dashboard"
								? activeColor
								: inactiveColor
						}
					/>
				</Svg>
			</TouchableOpacity>

			{/* TIMER SETUP */}
			<TouchableOpacity
				style={styles.tab}
				onPress={() => onTabChange("timer")}
			>
				<Svg width="20" height="18" viewBox="0 0 20 18" fill="none">
					<Path
						d="M4.94626 2.17781C5.0448 2.0803 5.12207 1.96342 5.1732 1.83455C5.22432 1.70568 5.24819 1.56762 5.2433 1.42907C5.23842 1.29052 5.20487 1.15448 5.14479 1.02954C5.08471 0.904595 4.9994 0.793454 4.89422 0.703125C4.36496 0.251425 3.69254 0.00225728 2.99673 0L2.84344 0.00421858H2.82094C1.23423 0.100781 -0.00327474 1.47891 6.51002e-06 3.14062C6.51002e-06 4.03125 0.375006 4.50281 0.671256 4.88016C0.754387 4.98565 0.858601 5.07265 0.977245 5.13561C1.09589 5.19856 1.22636 5.23608 1.36032 5.24578C1.37251 5.24578 1.39313 5.24813 1.45407 5.24813C1.57457 5.24795 1.69379 5.2234 1.80455 5.17595C1.91532 5.1285 2.01534 5.05914 2.0986 4.97203L4.94626 2.17781Z"
						fill={
							activeTab === "timer" ? activeColor : inactiveColor
						}
					/>
					<Path
						d="M16.6745 0.00468743L16.5212 0H16.4969C15.8004 0.00181332 15.1272 0.251008 14.5975 0.703125C14.4925 0.793449 14.4073 0.904536 14.3473 1.02939C14.2873 1.15425 14.2538 1.29018 14.2489 1.42861C14.244 1.56705 14.2679 1.705 14.3189 1.83377C14.3699 1.96255 14.4471 2.07937 14.5455 2.17687L17.3941 4.97297C17.4775 5.06039 17.5778 5.12997 17.6889 5.17751C17.8 5.22504 17.9196 5.24955 18.0405 5.24953C18.1005 5.24953 18.1211 5.24953 18.1342 5.24719C18.2681 5.23743 18.3985 5.19987 18.517 5.13692C18.6356 5.07397 18.7397 4.987 18.8228 4.88156C19.1209 4.50422 19.4922 4.03406 19.4941 3.14203C19.4969 1.47844 18.2594 0.100312 16.6745 0.00468743Z"
						fill={
							activeTab === "timer" ? activeColor : inactiveColor
						}
					/>
					<Path
						d="M9.75019 1.5C5.20332 1.5 1.50019 5.20078 1.50019 9.75C1.49858 11.6788 2.17579 13.5467 3.41316 15.0262L1.72003 16.7198C1.64873 16.7891 1.59192 16.8719 1.55289 16.9633C1.51386 17.0547 1.4934 17.153 1.49269 17.2524C1.49199 17.3518 1.51106 17.4504 1.54878 17.5424C1.58651 17.6344 1.64215 17.7179 1.71246 17.7882C1.78277 17.8585 1.86636 17.9141 1.95835 17.9518C2.05034 17.9895 2.14891 18.0085 2.24832 18.0077C2.34773 18.007 2.446 17.9865 2.53742 17.9474C2.62883 17.9083 2.71157 17.8515 2.78082 17.7802L4.47394 16.087C5.95434 17.323 7.82166 18 9.75019 18C11.6787 18 13.546 17.323 15.0264 16.087L16.72 17.7802C16.7893 17.8515 16.872 17.9083 16.9634 17.9474C17.0548 17.9865 17.1531 18.007 17.2525 18.0077C17.3519 18.0085 17.4505 17.9895 17.5425 17.9518C17.6345 17.9141 17.7181 17.8585 17.7884 17.7882C17.8587 17.7179 17.9143 17.6344 17.9521 17.5424C17.9898 17.4504 18.0089 17.3518 18.0082 17.2524C18.0075 17.153 17.987 17.0547 17.948 16.9633C17.9089 16.8719 17.8521 16.7891 17.7808 16.7198L16.0872 15.0262C17.3248 13.5468 18.002 11.6788 18.0002 9.75C18.0002 5.20312 14.2994 1.5 9.75019 1.5ZM10.5002 9.75C10.5002 9.94891 10.4212 10.1397 10.2805 10.2803C10.1399 10.421 9.9491 10.5 9.75019 10.5H6.00019C5.80128 10.5 5.61051 10.421 5.46986 10.2803C5.32921 10.1397 5.25019 9.94891 5.25019 9.75C5.25019 9.55109 5.32921 9.36032 5.46986 9.21967C5.61051 9.07902 5.80128 9 6.00019 9H9.00019V4.5C9.00019 4.30109 9.07921 4.11032 9.21986 3.96967C9.36051 3.82902 9.55128 3.75 9.75019 3.75C9.9491 3.75 10.1399 3.82902 10.2805 3.96967C10.4212 4.11032 10.5002 4.30109 10.5002 4.5V9.75Z"
						fill={
							activeTab === "timer" ? activeColor : inactiveColor
						}
					/>
				</Svg>
			</TouchableOpacity>

			{/* SETTINGS */}
			<TouchableOpacity
				style={styles.tab}
				onPress={() => onTabChange("settings")}
			>
				<Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<Path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M11.565 1.42709C11.1031 -0.475695 8.39695 -0.475695 7.93501 1.42708C7.63661 2.65626 6.22836 3.23957 5.1482 2.58142C3.4761 1.56259 1.56259 3.47609 2.58142 5.1482C3.23957 6.22836 2.65626 7.63661 1.42708 7.93501C-0.475695 8.39695 -0.475695 11.1031 1.42709 11.565C2.65626 11.8634 3.23957 13.2716 2.58142 14.3518C1.56259 16.0239 3.4761 17.9374 5.1482 16.9186C6.22836 16.2604 7.63661 16.8437 7.93501 18.0729C8.39695 19.9757 11.1031 19.9757 11.565 18.0729C11.8634 16.8437 13.2716 16.2604 14.3518 16.9186C16.0239 17.9374 17.9374 16.0239 16.9186 14.3518C16.2604 13.2716 16.8437 11.8634 18.0729 11.565C19.9757 11.1031 19.9757 8.39695 18.0729 7.93501C16.8437 7.63661 16.2604 6.22836 16.9186 5.1482C17.9374 3.47609 16.0239 1.56259 14.3518 2.58142C13.2716 3.23957 11.8634 2.65626 11.565 1.42709ZM9.75 13.4062C11.7693 13.4062 13.4062 11.7693 13.4062 9.75C13.4062 7.73071 11.7693 6.09375 9.75 6.09375C7.73071 6.09375 6.09375 7.73071 6.09375 9.75C6.09375 11.7693 7.73071 13.4062 9.75 13.4062Z"
						fill={
							activeTab === "settings"
								? activeColor
								: inactiveColor
						}
					/>
				</Svg>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	navContainer: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-around",
		// Remove alignItems: 'center' to allow content to sit at the top of the container
		alignItems: "flex-start",
	},
	tab: {
		flex: 1,
		height: 56, // Fixed height for the icons and hit area
		justifyContent: "center",
		alignItems: "center",
	},
	lightShadow: {
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: -2 },
				shadowOpacity: 0.15,
				shadowRadius: 3,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	darkBorder: {
		borderTopWidth: 1,
		borderTopColor: "rgba(217, 217, 217, 0.50)",
	},
});

export default NavigationBar;


import React, { useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";

import ResetIcon from "../icons/ResetIcon";
import BookmarkIcon from "../icons/BookmarkIcon";

const { width } = Dimensions.get("window");

const CIRCLE_SIZE = 38;

interface Props {
  theme: any;
  onPowerPress?: () => void;
  onResetPress?: () => void;
  onBookmarkPress?: (isBookmarked: boolean) => void;
}

// Control Center background svg
const lightSvg = `<svg width="412" height="153" viewBox="0 0 412 153" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#a)"><path d="M0 73.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z" fill="#e7e7e7"/></g><defs><filter id="a" x="-28.2" y="0" width="468.4" height="152.948" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="14.1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1997_3299"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1997_3299"/><feOffset/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="effect1_dropShadow_1997_3299" result="effect2_dropShadow_1997_3299"/><feBlend in="SourceGraphic" in2="effect2_dropShadow_1997_3299" result="shape"/></filter></defs></svg>`;

const darkSvg = `<svg width="412" height="154" viewBox="0 0 412 154" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#a)"><mask id="b" maskUnits="userSpaceOnUse" x="0" y="28.2" width="412" height="98" fill="#000"><path fill="#fff" d="M0 28.2h412v98H0z"/><path d="M0 74.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z"/></mask><path d="M0 74.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z" fill="#141414" shape-rendering="crispEdges"/><path d="M0 74.2c0-25.405 20.595-46 46-46h320c25.405 0 46 20.595 46 46 0-24.3-20.147-44-45-44H45c-24.853 0-45 19.7-45 44m412 51.548H0zm-412 0V29.2zM412 29.2v96.548z" fill="#d9d9d9" fill-opacity=".5" mask="url(#b)"/></g><defs><filter id="a" x="-28.2" y="0" width="468.4" height="153.948" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="14.1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1997_1155"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1997_1155"/><feOffset/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="effect1_dropShadow_1997_1155" result="effect2_dropShadow_1997_1155"/><feBlend in="SourceGraphic" in2="effect2_dropShadow_1997_1155" result="shape"/></filter></defs></svg>`;

// Power button SVG with shadow - Light mode
const powerButtonLightSvg = `<svg width="76" height="74" viewBox="0 0 76 74" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#buttonShadowLight)">
    <rect x="8" y="7" width="60" height="60" rx="20" fill="#D52222"/>
    <g transform="translate(22, 21)">
      <path d="M15.869 31.738C7.119 31.738 0 24.607 0 15.842c0-4.764 2.079-9.23 5.704-12.248a1.678 1.678 0 1 1 2.149 2.578c-2.857 2.38-4.496 5.905-4.496 9.67 0 6.914 5.613 12.539 12.512 12.539S28.38 22.756 28.38 15.842a12.51 12.51 0 0 0-4.564-9.662 1.679 1.679 0 1 1 2.136-2.588 15.86 15.86 0 0 1 5.785 12.25c0 8.765-7.119 15.896-15.868 15.896" fill="#fff"/>
      <path d="M15.868 17.09a1.68 1.68 0 0 1-1.678-1.68V1.679a1.679 1.679 0 0 1 3.357 0v13.733a1.68 1.68 0 0 1-1.679 1.678" fill="#fff"/>
    </g>
  </g>
  <defs>
    <filter id="buttonShadowLight" x="-4" y="-1" width="84" height="82" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.30"/>
    </filter>
  </defs>
</svg>`;

// Power button SVG with shadow - Dark mode
const powerButtonDarkSvg = `<svg width="76" height="74" viewBox="0 0 76 74" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#buttonShadowDark)">
    <rect x="8" y="7" width="60" height="60" rx="20" fill="#141414" stroke="rgba(217, 217, 217, 0.50)" stroke-width="1"/>
    <g transform="translate(22, 21)">
      <path d="M15.869 31.738C7.119 31.738 0 24.607 0 15.842c0-4.764 2.079-9.23 5.704-12.248a1.678 1.678 0 1 1 2.149 2.578c-2.857 2.38-4.496 5.905-4.496 9.67 0 6.914 5.613 12.539 12.512 12.539S28.38 22.756 28.38 15.842a12.51 12.51 0 0 0-4.564-9.662 1.679 1.679 0 1 1 2.136-2.588 15.86 15.86 0 0 1 5.785 12.25c0 8.765-7.119 15.896-15.868 15.896" fill="#d52222"/>
      <path d="M15.868 17.09a1.68 1.68 0 0 1-1.678-1.68V1.679a1.679 1.679 0 0 1 3.357 0v13.733a1.68 1.68 0 0 1-1.679 1.678" fill="#d52222"/>
    </g>
  </g>
  <defs>
    <filter id="buttonShadowDark" x="-4" y="-1" width="84" height="82" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.30"/>
    </filter>
  </defs>
</svg>`;

const ControlCenter: React.FC<Props> = ({
  theme,
  onPowerPress,
  onResetPress,
  onBookmarkPress,
}) => {
  const isDarkMode = theme?.background === "#060606";
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkPress = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    onBookmarkPress?.(newBookmarkState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.svgBackground}>
        <SvgXml
          xml={isDarkMode ? darkSvg : lightSvg}
          width="100%"
          height="100%"
        />
      </View>

      <View style={styles.buttonContainer}>
        {/* Reset Button */}
        <TouchableOpacity
          key={`reset-${isDarkMode}`}
          onPress={onResetPress}
          activeOpacity={0.7}
          style={[
            styles.circleButton,
            isDarkMode ? styles.circleButtonDark : styles.circleButtonLight,
          ]}
        >
          <ResetIcon darkMode={isDarkMode} width={18} height={18} />
        </TouchableOpacity>

        {/* Main Power Button */}
        <TouchableOpacity
          onPress={onPowerPress}
          activeOpacity={0.7}
          style={styles.powerButtonWrapper}
        >
          <SvgXml
            xml={isDarkMode ? powerButtonDarkSvg : powerButtonLightSvg}
            width={76}
            height={74}
          />
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          key={`bookmark-${isDarkMode}`}
          onPress={handleBookmarkPress}
          activeOpacity={0.7}
          style={[
            styles.circleButton,
            isDarkMode ? styles.circleButtonDark : styles.circleButtonLight,
          ]}
        >
          <BookmarkIcon
            darkMode={isDarkMode}
            outline={!isBookmarked}
            width={13}
            height={18}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 145,
    alignSelf: "center",
    // FIX: Pulls the navigation bar up to collapse the asset's transparent padding zone
    marginBottom: -30, 
  },
  svgBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    // FIX: Shifted down slightly to account for the layout pull-down adjustment
    marginTop: 36, 
    zIndex: 1,
  },
  powerButtonWrapper: {
    width: 76,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButton: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonLight: {
    backgroundColor: "#E7E7E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  circleButtonDark: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default ControlCenter;