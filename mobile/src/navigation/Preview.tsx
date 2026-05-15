import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import TimerCard from "../components/ui/TimerCard";

export default function Preview({ theme }: { theme: any }) {
  return (
    <ScrollView 
      contentContainerStyle={[
        styles.content, 
        { backgroundColor: theme.background }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* The fully assembled Timer Card */}
      <TimerCard theme={theme} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
});