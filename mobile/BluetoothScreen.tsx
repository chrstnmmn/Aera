import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";

// Assets & Components
import WizardBluetoothIcon from "./WizardBluetoothIcon";
import RadarIcon from "./RadarIcon";
import DeviceCard from "./DeviceCard"; // <-- Import your new component!

const { width, height } = Dimensions.get("window");

interface Props {
  theme: any;
  onNext?: () => void;
}

const BluetoothScreen: React.FC<Props> = ({ theme, onNext }) => {
  // --- STATE & ANIMATION ---
  const [isSearching, setIsSearching] = useState(true);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(false);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim]);

  return (
    <View style={styles.content}>
      {/* Giant Background Graphic */}
      <View style={styles.btGraphicWrapper}>
        <WizardBluetoothIcon
          width={width * 1.3}
          height={height * 0.45}
          fill={theme.boxGraphic}
        />
      </View>

      {/* Text Section */}
      <View style={styles.textWrapperBluetooth}>
        <Text style={[styles.massiveText, { color: theme.text }]}>
          Bluetooth
        </Text>
        <Text style={[styles.subText, { color: theme.text }]}>
          Make sure your phone's Bluetooth is on{"\n"}and the device is powered
          up.
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomControlsWrapper}>
        {/* DEVICE CARD (Hidden while searching) */}
        {!isSearching && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              width: "100%",
              marginBottom: 20,
            }}
          >
            {/* The extracted modular card! */}
            <DeviceCard
              theme={theme}
              onConnect={onNext}
              deviceName="Aera Nano"
            />
          </Animated.View>
        )}

        {/* PERSISTENT STATUS ROW */}
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: theme.text }]}>
            {isSearching ? "Searching for Aera..." : "Device Found: 1"}
          </Text>
          <RadarIcon width={22} height={18} color={theme.text} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  btGraphicWrapper: {
    position: "absolute",
    top: -height * 0.01,
    right: -width * 0.4,
    zIndex: -1,
  },
  textWrapperBluetooth: {
    marginTop: height * 0.45,
  },
  massiveText: {
    fontSize: 60,
    fontFamily: "SFPro-Black",
    lineHeight: 66,
    letterSpacing: -1.5,
  },
  subText: {
    fontSize: 16,
    fontFamily: "SFPro-Medium",
    lineHeight: 22,
  },
  bottomControlsWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 5,
  },
  statusText: {
    fontSize: 16,
    fontFamily: "SFPro-Medium",
  },
});

export default BluetoothScreen;
