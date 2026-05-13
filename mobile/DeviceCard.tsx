import React, { useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import HardwareIcon from "./HardwareIcon";

interface Props {
  theme: any;
  onConnect?: () => void;
  deviceName?: string;
}

const DeviceCard: React.FC<Props> = ({
  theme,
  onConnect,
  deviceName = "Aera Nano",
}) => {
  const isDarkMode = theme.background === "#060606";
  const leftBoxBg = isDarkMode ? "#141414" : "#E7E7E7";
  const blueBoxBg = isDarkMode ? "#1CA7ED" : "#1497D9";
  const boxTextColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";

  // --- SHRINK PRESS ANIMATION ---
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85, // Shrinks to 85% size
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Snaps back to full size
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // --- ANDROID ELEVATION ---
  const elevationBase = isDarkMode ? 0 : 2;
  const elevationTop = isDarkMode ? 0 : 4;
  const elevationText = isDarkMode ? 0 : 6;

  return (
    <View 
      key={`card-${isDarkMode}`} 
      style={styles.cardContainer}
    >
      {/* 1. THE BASE LAYER (Blue) */}
      <View
        style={[
          styles.fullBlueBase,
          {
            backgroundColor: blueBoxBg,
            elevation: elevationBase,
            shadowColor: "#000",
          },
        ]}
      />

      {/* 2. THE TOP LAYER (Gray Overlay) */}
      <View
        style={[
          styles.overlayGrayBox,
          {
            backgroundColor: leftBoxBg,
            elevation: elevationTop,
            shadowColor: "#000",
          },
          isDarkMode && styles.darkBorder,
        ]}
      >
        <HardwareIcon fill={boxTextColor} />
        <Text
          style={[styles.deviceName, { color: boxTextColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {deviceName}
        </Text>
      </View>

      {/* 3. INTERACTIVE LAYER (The Shrinking Text) */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onConnect}
        style={styles.buttonHitbox}
      >
        <Animated.View
          style={{
            elevation: elevationText,
            transform: [{ scale: scaleAnim }], // Swapped slide for scale
            zIndex: 10,
          }}
        >
          <Text style={styles.connectBtnText} numberOfLines={1}>
            Connect
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 66.25,
    position: "relative",
  },
  fullBlueBase: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 0,
  },
  overlayGrayBox: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "70%",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 15,
    gap: 12,
  },
  darkBorder: {
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.2)",
  },
  deviceName: {
    flex: 1,
    fontFamily: "aera_medium",
    fontSize: 20,
    letterSpacing: -0.3,
  },
  buttonHitbox: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "29%",
    justifyContent: "center",
    alignItems: "center",
  },
  connectBtnText: {
    color: "#E7E7E7",
    fontFamily: "aera_bold",
    fontSize: 20,
    letterSpacing: -0.3,
  },
});

export default DeviceCard;