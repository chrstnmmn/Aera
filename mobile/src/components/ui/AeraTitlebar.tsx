import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import Svg, { Path, G, Mask } from "react-native-svg";

// Individual icon imports
import AeraIcon from "../icons/AeraIcon";
import WifiIconTitleBar from "../icons/WifiIconTitleBar";
import CloudConnectedIconTitleBar from "../icons/CloudConnectedIconTitleBar";
import CloudDisconnectedIconTitleBar from "../icons/CloudDisconnectedIconTitleBar";
import SetupTimerIconTitleBar from "../icons/SetupTimerIconTitleBar";
import MyPresetMenuIcon from "../icons/MyPresetMenuIcon";
import SettingsIconTitlebar from "../icons/SettingsIconTitlebar";

interface AeraTitlebarProps {
  mode: "dashboard" | "setup" | "settings";
  theme: any;
  status?: "connecting" | "connected" | "offline";
  onPresetPress?: () => void;
}

const AeraTitlebar = ({
  mode,
  theme,
  status = "offline",
  onPresetPress,
}: AeraTitlebarProps) => {
  const isDarkMode = theme.barSurface.toLowerCase().trim() === "#141414";

  // Figma Path Data
  const mainPath = "M0 0h412v35.49c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20z";
  const borderPath = "M0 0h412zm412 35.49c0 11.599-9.402 21-21 21H21c-11.598 0-21-9.401-21-21 0 10.494 8.954 19 20 19h372c11.046 0 20-8.506 20-19m-412 20V0zM412 0v55.49z";

  const renderLeft = () => {
    switch (mode) {
      case "dashboard":
        return (
          <View style={styles.leftGroup}>
            <AeraIcon color={theme.text} size={18} />
            <Text style={[styles.titleText, { color: theme.text }]}>Aera Nano</Text>
          </View>
        );
      case "setup":
        return (
          <View style={styles.leftGroup}>
            <SetupTimerIconTitleBar color={theme.text} size={20} />
            <Text style={[styles.titleText, { color: theme.text }]}>Setup</Text>
          </View>
        );
      case "settings":
        return (
          <View style={styles.leftGroup}>
            <SettingsIconTitlebar color={theme.text} size={14} />
            <Text style={[styles.titleText, { color: theme.text }]}>Settings</Text>
          </View>
        );
    }
  };

  const renderRight = () => {
    if (mode === "dashboard") {
      return (
        <View style={styles.statusGroup}>
          <Text style={[styles.statusLabel, { color: theme.text }]}>
            {status === "connecting" ? "Connecting" : status === "connected" ? "Connected" : "Offline"}
          </Text>
          {status === "connecting" && <WifiIconTitleBar color={theme.text} />}
          {status === "connected" && <CloudConnectedIconTitleBar color={theme.text} />}
          {status === "offline" && <CloudDisconnectedIconTitleBar color={theme.text} />}
        </View>
      );
    }
    if (mode === "setup") {
      return (
        <TouchableOpacity
          style={[styles.presetButton, isDarkMode && styles.presetButtonDark]}
          activeOpacity={0.8}
          onPress={onPresetPress}
        >
          <MyPresetMenuIcon size={12} color="#E7E7E7" />
          <Text style={styles.presetText}>My Preset</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.shell}>
      {/* 1. VISUAL BACKGROUND (Handles the shadow and color) */}
      <View 
        style={[
          styles.background, 
          { backgroundColor: theme.barSurface }
        ]} 
      />

      {/* 2. SVG LAYER (Only for the Dark Mode border effect) */}
      {isDarkMode && (
        <View style={styles.svgOverlay}>
          <Svg width="100%" height="100%" viewBox="0 0 412 56" preserveAspectRatio="none">
            <Mask id="m">
              <Path d={mainPath} fill="white" />
            </Mask>
            <Path d={borderPath} fill="#d9d9d9" fillOpacity="0.5" mask="url(#m)" />
          </Svg>
        </View>
      )}

      {/* 3. CONTENT LAYER */}
      <View style={styles.content}>
        {renderLeft()}
        {renderRight()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    height: 56, // Fixed height to match Figma bar
    backgroundColor: "transparent",
    zIndex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // THE SHADOW FIX
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 15, // High elevation for the bottom shadow
      },
    }),
  },
  svgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleText: {
    fontFamily: "aera_bold",
    fontSize: 14,
    letterSpacing: -0.5,
  },
  statusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusLabel: {
    fontFamily: "aera_medium",
    fontSize: 12,
  },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E2E",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  presetButtonDark: {
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  presetText: {
    color: "#E7E7E7",
    fontFamily: "aera_bold",
    fontSize: 12,
  },
});

export default AeraTitlebar;