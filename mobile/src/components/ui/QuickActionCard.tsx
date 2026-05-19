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