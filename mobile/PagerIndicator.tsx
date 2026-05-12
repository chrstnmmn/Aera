import React from "react";
import { StyleSheet, View } from "react-native";

interface PagerProps {
  step: number;
  theme: any;
  totalSteps?: number; // Added this prop
}

const PagerIndicator: React.FC<PagerProps> = ({
  step,
  theme,
  totalSteps = 4,
}) => {
  // Create an array based on totalSteps (e.g., [0, 1, 2, 3])
  const stepsArray = Array.from(Array(totalSteps).keys());

  return (
    <View style={styles.indicatorContainer}>
      {stepsArray.map((index) => (
        <View
          key={index}
          style={[
            styles.pill,
            {
              backgroundColor:
                index === step ? theme.primaryBlue : theme.pillInactive,
            },
            index === step && styles.pillActiveWidth,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: "row",
    gap: 8,
  },
  pill: { height: 8, width: 8, borderRadius: 4 },
  pillActiveWidth: { width: 24 },
});

export default PagerIndicator;
