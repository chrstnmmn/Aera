import React, { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";

interface Props {
  disabled?: boolean;
}

const PausePlayButton: React.FC<Props> = ({ disabled = false }) => {
  // isDrying = true means the machine is running, so we show the "Pause" option.
  const [isDrying, setIsDrying] = useState(true);

  const handleToggle = () => {
    if (!disabled) {
      setIsDrying(!isDrying);
    }
  };

  // Switch content color based on the disabled state
  const contentColor = disabled ? "rgba(54, 54, 54, 0.5)" : "#2E2E2E";

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <View style={styles.iconContainer}>
        {isDrying ? (
          <PauseIcon fill={contentColor} width={12} height={16} />
        ) : (
          <PlayIcon fill={contentColor} width={14} height={16} />
        )}
      </View>
      
      <Text style={[styles.label, { color: contentColor }]}>
        {isDrying ? "Pause Drying" : "Continue Drying"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6B91E",
    paddingVertical:4,
    paddingHorizontal: 14,
    borderRadius: 100,
    // Android Elevation to match your CSS box-shadow
    elevation: 6,
    shadowColor: "#000",
  },
  buttonPressed: {
    // Slight visual feedback when tapped
    opacity: 0.8,
    elevation: 2, 
  },
  buttonDisabled: {
    // When disabled, the shadow typically flattens out
    elevation: 1,
  },
  iconContainer: {
    width: 16, // Fixed width so the text doesn't jump when switching icons
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