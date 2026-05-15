import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import ChamberTempIcon from "../icons/ChamberTempIcon";
import HeaterTempIcon from "../icons/HeaterTempIcon";
import RelativeHumidityIcon from "../icons/RelativeHumidityIcon";
import FanSpeedMonitorIcon from "../icons/FanSpeedMonitorIcon";

interface Props {
  theme: any;
}

const SystemMonitor: React.FC<Props> = ({ theme }) => {
  const isDarkMode = theme.background === "#060606";
  const textColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";

  const [data, setData] = useState({ temp: 20, humidity: 0, fan: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        temp: Math.floor(Math.random() * (70 - 20 + 1)) + 20,
        humidity: Math.floor(Math.random() * 101),
        fan: Math.floor(Math.random() * 101),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      key={isDarkMode ? "monitor-dark" : "monitor-light"}
      style={[
        styles.base,
        { backgroundColor: isDarkMode ? "#141414" : "#E7E7E7" },
        isDarkMode && styles.darkBorder,
      ]}
    >
      <View style={styles.grid}>
        
        {/* TOP LEFT: CHAMBER TEMP */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Chamber Temp (°C)</Text>
            <ChamberTempIcon fill={textColor} width={8} height={16} />
          </View>
          <Text style={[styles.mainValue, { color: textColor }]}>{data.temp}°</Text>
        </View>

        {/* TOP RIGHT: HEATER TEMP */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Heater Temp (°C)</Text>
            <HeaterTempIcon fill={textColor} width={15} height={16} />
          </View>
          <Text style={[styles.mainValue, { color: textColor }]}>{data.temp}°</Text>
        </View>

        {/* BOTTOM LEFT: HUMIDITY */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Relative Humidity</Text>
            <RelativeHumidityIcon fill={textColor} width={12} height={16} />
          </View>
          <Text style={[styles.mainValue, { color: textColor }]}>{data.humidity}%</Text>
        </View>

        {/* BOTTOM RIGHT: FAN SPEED */}
        <View style={styles.cell}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { color: textColor }]}>Fan Speed</Text>
            <FanSpeedMonitorIcon fill={textColor} width={18} height={15} />
          </View>
          
          {/* THE FIX: These rows now combine to exactly 60px height to match the Humidity text */}
          <View style={styles.fanRow}>
            <Text style={[styles.fanLabel, { color: textColor }]}>Intake</Text>
            <Text style={[styles.fanValue, { color: textColor }]}>{data.fan}%</Text>
          </View>
          
          <View style={styles.fanRow}>
            <Text style={[styles.fanLabel, { color: textColor }]}>Exhaust</Text>
            <Text style={[styles.fanValue, { color: textColor }]}>{data.fan}%</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cell: {
    width: "48%",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 20, // Lock header height for better alignment
  },
  headerText: {
    fontFamily: "aera_semibold",
    fontSize: 13,
  },
  mainValue: {
    fontFamily: "aera_small",
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: -1,
  },
  fanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30, // 30 + 30 = 60 (Matches Humidity lineHeight)
  },
  fanLabel: {
    fontFamily: "aera_medium",
    fontSize: 16,
    lineHeight: 30,
  },
  fanValue: {
    fontFamily: "aera_tiny",
    fontSize: 26,
    lineHeight: 30,
  },
});

export default SystemMonitor;