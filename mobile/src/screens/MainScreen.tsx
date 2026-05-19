import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";
import SystemMonitor from "../components/ui/SystemMonitor";
import TimerCard from "../components/ui/TimerCard";
import QuickActionCard from "../components/ui/QuickActionCard";
import TimerPickerCard from "../components/ui/TimerPickerCard";
import TemperaturePickerCard from "../components/ui/TemperaturePickerCard";
import ControlCenter from "../components/ui/ControlCenter";

interface MainProps {
  theme: any;
  onLogout: () => void;
}

const MainScreen: React.FC<MainProps> = ({ theme, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "timer" | "settings">("dashboard");
  const scrollViewRef = useRef<ScrollView>(null);

  const [deviceStatus] = useState({
    water: 75 as 0 | 25 | 50 | 75 | 100 | null,
    door: "locked" as "locked" | "unlocked" | "inactive",
    uvActive: true,
    wifiLevel: 3 as 1 | 2 | 3 | 4,
    connectionState: "connected" as "connecting" | "connected" | "offline",
  });

  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Reset scroll to top when keyboard hides
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const getTitlebarMode = () => (activeTab === "timer" ? "setup" : activeTab);

  const quickActions = [
    { id: "1", title: "Quick Dry", time: "20:05", subtitle: "min : sec 50°C" },
    { id: "2", title: "Body Towel", time: "02:30", subtitle: "hr : min 65°C" },
    { id: "3", title: "Cotton Shirt", time: "05:00", subtitle: "min : sec 55°C" },
  ];

  // Render the scrollable content inside a KeyboardAvoidingView only when on the timer tab
  const renderContent = () => {
    const scrollView = (
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "dashboard" && (
          <View style={styles.page}>
            <SystemMonitor theme={theme} />
            <TimerCard theme={theme} />
            <View style={styles.quickActionsSection}>
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.id}
                  theme={theme}
                  title={action.title}
                  time={action.time}
                  subtitle={action.subtitle}
                  state={activeActionId === action.id ? "power_enabled" : "default"}
                  onCardPress={() => setActiveActionId(prev => prev === action.id ? null : action.id)}
                  onPowerPress={() => console.log(`Starting ${action.title}...`)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === "timer" && (
          <View style={styles.page}>
            <TimerPickerCard theme={theme} />
            <TemperaturePickerCard theme={theme} />
          </View>
        )}
      </ScrollView>
    );

    // Only wrap in KeyboardAvoidingView for the timer tab to avoid layout shifts elsewhere
    if (activeTab === "timer") {
      return (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {scrollView}
        </KeyboardAvoidingView>
      );
    }

    // For dashboard and settings, render the scroll view directly inside a flex container
    return (
      <View style={styles.flex}>
        {scrollView}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. FIXED HEADER */}
      <View style={styles.headerContainer}>
        <AeraStatusBar theme={theme} status={deviceStatus} />
        <AeraTitlebar
          mode={getTitlebarMode()}
          theme={theme}
          status={deviceStatus.connectionState}
          onPresetPress={() => console.log("Preset Menu Pressed")}
        />
      </View>

      {/* 2. SCROLLABLE CONTENT (Conditionally wrapped for keyboard) */}
      {renderContent()}

      {/* 3. PINNED FOOTER */}
      <View style={styles.footer}>
        {activeTab === "timer" && (
          <View style={styles.controlCenterWrapper}>
            <ControlCenter theme={theme} />
          </View>
        )}
        <View style={styles.navBarWrapper}>
          <NavigationBar
            theme={theme}
            activeTab={activeTab}
            onTabChange={(tab: any) => setActiveTab(tab)}
          />
        </View>
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
    paddingBottom: 200,
  },
  page: { width: "100%", alignItems: "center", gap: 10 },
  quickActionsSection: { width: "100%", marginTop: 10, gap: 10 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  controlCenterWrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    elevation: 1,
  },
  navBarWrapper: {
    zIndex: 2,
    elevation: 2,
  },
});

export default MainScreen;