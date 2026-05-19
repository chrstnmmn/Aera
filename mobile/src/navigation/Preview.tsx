import React from "react";
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableWithoutFeedback, 
  Keyboard 
} from "react-native";
import TimerPickerCard from "../components/ui/TimerPickerCard";

export default function Preview({ theme }: { theme: any }) {
  return (
    // Dismisses the number-pad keyboard when tapping the background
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <View style={styles.block}>
          <Text style={[styles.label, { color: theme.text }]}>
            Timer Picker Card UI Preview
          </Text>
          
          {/* THE FIX: Just pass the theme. The card handles the rest natively now! */}
          <TimerPickerCard theme={theme} />
          
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  block: {
    gap: 16,
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontFamily: "aera_semibold",
    fontSize: 14,
    opacity: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
});