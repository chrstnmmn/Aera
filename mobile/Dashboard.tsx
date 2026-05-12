import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  theme: any;
  onLogout: () => void;
}

const Dashboard: React.FC<Props> = ({ theme, onLogout }) => {
  const isDarkMode = theme.background === "#060606";
  const cardBg = isDarkMode ? "#141414" : "#F5F5F5";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* DASHBOARD HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Aera Dashboard
            </Text>
            <Text style={[styles.statusLine, { color: theme.text }]}>
              Hardware: Connected
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: theme.primaryBlue }]}
            onPress={onLogout}
          >
            <Text style={styles.resetBtnText}>RESET</Text>
          </TouchableOpacity>
        </View>

        {/* METRICS GRID */}
        <View style={styles.grid}>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Temperature
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>31.2°C</Text>
          </View>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.label, { color: theme.text }]}>Humidity</Text>
            <Text style={[styles.value, { color: theme.text }]}>44%</Text>
          </View>
        </View>

        {/* SYSTEM LOGS */}
        <View style={[styles.traceBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.traceTitle, { color: theme.text }]}>
            Live System Trace
          </Text>
          <Text
            style={[
              styles.traceLog,
              { color: isDarkMode ? "#00FF00" : "#1B5E20" },
            ]}
          >
            {`> System Boot: SUCCESS\n> ESP32 Handshake: OK\n> BLE Telemetry: Active\n> Waiting for cycle start...`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  greeting: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  statusLine: { fontSize: 14, opacity: 0.6, fontWeight: "600" },
  resetBtn: { padding: 12, borderRadius: 12, justifyContent: "center" },
  resetBtnText: { color: "#FFF", fontWeight: "800", fontSize: 12 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  card: { width: "48%", padding: 20, borderRadius: 22 },
  label: { fontSize: 12, fontWeight: "600", opacity: 0.5, marginBottom: 4 },
  value: { fontSize: 24, fontWeight: "800" },
  traceBox: { width: "100%", padding: 20, borderRadius: 22, marginTop: 15 },
  traceTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  traceLog: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
});

export default Dashboard;
