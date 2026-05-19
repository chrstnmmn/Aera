import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import TimerPickerCard from "../components/ui/TimerPickerCard";
import TemperaturePickerCard from "../components/ui/TemperaturePickerCard";
import ControlCenter from "../components/ui/ControlCenter"; // <-- Added import

export default function Preview({ theme }: { theme: any }) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { backgroundColor: theme.background },
      ]}
      keyboardShouldPersistTaps="handled" // Automatically dismisses the keyboard when tapping outside inputs
    >
      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.text }]}>
          Timer Picker
        </Text>
        <TimerPickerCard theme={theme} />
      </View>

      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.text }]}>
          Temperature Picker
        </Text>
        <TemperaturePickerCard theme={theme} />
      </View>

      {/* ADDED: Control Center Block */}
      <View style={styles.block}>
        <Text style={[styles.label, { color: theme.text }]}>
          Control Center
        </Text>
        <ControlCenter theme={theme} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1, 
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40, 
    backgroundColor: "transparent",
    gap: 40, 
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