import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated } from "react-native";

interface PagerProps {
  step: number;
  theme: any;
  totalSteps?: number;
}

// Sub-component to handle individual pill animations
const AnimatedPill = ({ active, theme }: { active: boolean; theme: any }) => {
  // 1. Setup animated values for width and color-interpolation
  const widthAnim = useRef(new Animated.Value(active ? 24 : 8)).current;
  const colorAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    // 2. Run animations in parallel when the 'active' state changes
    Animated.parallel([
      Animated.spring(widthAnim, {
        toValue: active ? 24 : 8,
        useNativeDriver: false, // Width doesn't support native driver
        bounciness: 10,
      }),
      Animated.timing(colorAnim, {
        toValue: active ? 1 : 0,
        duration: 300,
        useNativeDriver: false, // Color doesn't support native driver
      }),
    ]).start();
  }, [active]);

  // 3. Interpolate the color value
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.pillInactive, theme.primaryBlue],
  });

  return (
    <Animated.View
      style={[
        styles.pill,
        {
          width: widthAnim,
          backgroundColor: backgroundColor,
        },
      ]}
    />
  );
};

const PagerIndicator: React.FC<PagerProps> = ({
  step,
  theme,
  totalSteps = 4,
}) => {
  const stepsArray = Array.from(Array(totalSteps).keys());

  return (
    <View style={styles.indicatorContainer}>
      {stepsArray.map((index) => (
        <AnimatedPill 
          key={index} 
          active={index === step} 
          theme={theme} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  pill: { 
    height: 8, 
    borderRadius: 4 
  },
});

export default PagerIndicator;