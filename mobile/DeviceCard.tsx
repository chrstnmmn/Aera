import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import HardwareIcon from "./HardwareIcon";

interface Props {
  theme: any;
  onConnect?: () => void;
  deviceName?: string; // Made dynamic so you can reuse this component!
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

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { backgroundColor: blueBoxBg }]}
      activeOpacity={0.8}
      onPress={onConnect}
    >
      {/* Left Box (Device Name & Icon) */}
      <View
        style={[
          styles.leftBox,
          { backgroundColor: leftBoxBg },
          isDarkMode && styles.leftBoxBorderDark,
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

      {/* Right Box (Connect Text) */}
      <View style={styles.connectTextWrapper}>
        <Text style={styles.connectBtnText} numberOfLines={1}>
          Connect
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    minHeight: 66.25,
    flexDirection: "row",
    borderRadius: 20,

    // Platform-specific parent shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 7,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  leftBox: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 15,
    gap: 12,
    zIndex: 2,

    // Platform-specific overlap shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
        shadowColor: "#000",
      },
    }),
  },
  leftBoxBorderDark: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  deviceName: {
    flex: 1,
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  connectTextWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  connectBtnText: {
    color: "#E7E7E7",
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
});

export default DeviceCard;
