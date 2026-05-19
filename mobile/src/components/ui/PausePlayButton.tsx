import React from "react"; // Removed useState since state is now handled globally
import { Pressable, Text, StyleSheet, View } from "react-native";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";

interface Props {
  disabled?: boolean;
  isPaused: boolean;     // Added: Drives the button's layout structure
  onPress: () => void;   // Added: Fires when the button is tapped
}

const PausePlayButton: React.FC<Props> = ({ 
  disabled = false, 
  isPaused, 
  onPress 
}) => {
  // Switch content color based on the disabled state
  const contentColor = disabled ? "rgba(54, 54, 54, 0.5)" : "#2E2E2E";

  return (
    <Pressable
      onPress={onPress} // Directly triggers the pause engine handler passed from MainScreen
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <View style={styles.iconContainer}>
        {/* If the timer is paused, display the Play icon to let them resume */}
        {isPaused ? (
          <PlayIcon fill={contentColor} width={14} height={16} />
        ) : (
          <PauseIcon fill={contentColor} width={12} height={16} />
        )}
      </View>
      
      <Text style={[styles.label, { color: contentColor }]}>
        {isPaused ? "Continue Drying" : "Pause Drying"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6B91E",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 100,
    elevation: 6,
    shadowColor: "#000",
  },
  buttonPressed: {
    opacity: 0.8,
    elevation: 2, 
  },
  buttonDisabled: {
    elevation: 1,
  },
  iconContainer: {
    width: 16, 
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