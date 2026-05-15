import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";

// Content Placeholders (Replace these with your actual Dashboard/Setup components later)
const DashboardPlaceholder = ({ theme }: any) => (
  <View style={styles.center}>
    <Text style={[styles.placeholderText, { color: theme.text }]}>DASHBOARD SCREEN</Text>
  </View>
);

const TimerPlaceholder = ({ theme }: any) => (
  <View style={styles.center}>
    <Text style={[styles.placeholderText, { color: theme.text }]}>TIMER SETUP SCREEN</Text>
  </View>
);

const SettingsPlaceholder = ({ theme }: any) => (
  <View style={styles.center}>
    <Text style={[styles.placeholderText, { color: theme.text }]}>SETTINGS SCREEN</Text>
  </View>
);

interface MainProps {
  theme: any;
  onLogout: () => void;
}

const MainScreen: React.FC<MainProps> = ({ theme, onLogout }) => {
  // 1. Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "timer" | "settings">("dashboard");

  // 2. Hardware/Telemetry State (This flows into both Bars)
  const [deviceStatus, setDeviceStatus] = useState({
    water: 75 as 0 | 25 | 50 | 75 | 100 | null,
    door: "locked" as "locked" | "unlocked" | "inactive",
    uvActive: true,
    wifiLevel: 3 as 1 | 2 | 3 | 4,
    connectionState: "connected" as "connecting" | "connected" | "offline",
  });

  // Helper to map tab names to Titlebar modes
  const getTitlebarMode = () => {
    if (activeTab === "timer") return "setup";
    return activeTab;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* HEADER STACK: Logo Bar + Mode Bar */}
      <View style={styles.headerStack}>
        {/* Top Layer: Logo and Hardware Telemetry */}
        <AeraStatusBar theme={theme} status={deviceStatus} />
        
        {/* Bottom Layer: Screen Title and Actions */}
        <AeraTitlebar
          mode={getTitlebarMode()}
          theme={theme}
          status={deviceStatus.connectionState}
          onPresetPress={() => console.log("Preset Menu Pressed")}
        />
      </View>

      {/* CONTENT AREA: Fills remaining space */}
      <View style={styles.content}>
        {activeTab === "dashboard" && <DashboardPlaceholder theme={theme} />}
        {activeTab === "timer" && <TimerPlaceholder theme={theme} />}
        {activeTab === "settings" && <SettingsPlaceholder theme={theme} />}
      </View>

      {/* BOTTOM NAVIGATION */}
      <NavigationBar
        theme={theme}
        activeTab={activeTab}
        onTabChange={(tab: any) => setActiveTab(tab)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerStack: {
    // No padding here ensures the Titlebar sits flush against the Logo bar
    zIndex: 10, // Ensures shadows cast over the content below
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: "aera_black",
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default MainScreen;