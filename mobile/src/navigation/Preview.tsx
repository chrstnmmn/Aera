import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import QuickActionCard, { QuickActionState } from "../components/ui/QuickActionCard";
import PausePlayButton from "../components/ui/PausePlayButton";

export default function Preview({ theme }: { theme: any }) {
  // A simple state cycle so you can test the animation interactively!
  const states: QuickActionState[] = ["default", "power_enabled", "power_disabled", "disabled"];
  const [activeStateIndex, setActiveStateIndex] = useState(0);

  const cycleState = () => {
    setActiveStateIndex((prev) => (prev + 1) % states.length);
  };

  const currentState = states[activeStateIndex];

  return (
    <ScrollView 
      contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.interactiveBlock}>
        <Text style={[styles.label, { color: theme.text }]}>
          Interactive Demo: Tap below to cycle states!
        </Text>
        <Text style={[styles.stateLabel, { color: theme.text }]}>
          Current State: {currentState}
        </Text>
        
        {/* INTERACTIVE CARD */}
        <QuickActionCard 
          theme={theme} 
          state={currentState} 
          onCardPress={cycleState}
          onPowerPress={() => console.log("Power Tapped")}
        />
      </View>

      <View style={styles.divider} />

      {/* STATIC COMPARISON GRID */}
      <Text style={[styles.label, { color: theme.text }]}>All States Overview</Text>

      <View style={styles.stack}>
        <QuickActionCard theme={theme} state="default" title="Default" />
        <QuickActionCard theme={theme} state="power_enabled" title="Power Enabled" />
        <QuickActionCard theme={theme} state="power_disabled" title="Power Disabled" />
        <QuickActionCard theme={theme} state="disabled" title="Full Disabled" />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 30,
  },
  interactiveBlock: {
    gap: 12,
  },
  stack: {
    gap: 20,
  },
  label: {
    fontFamily: "aera_semibold",
    fontSize: 14,
    opacity: 0.6,
    textTransform: "uppercase",
  },
  stateLabel: {
    fontFamily: "aera_medium",
    fontSize: 14,
    color: "#D52222",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(161, 161, 161, 0.2)",
    marginVertical: 10,
  }
});