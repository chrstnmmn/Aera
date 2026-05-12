import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import SuccessBoxIcon from "./SuccessBoxIcon";
import ProceedArrow from "./ProceedArrow";

const { width, height } = Dimensions.get("window");

interface Props {
  theme: any;
  onFinish?: () => void;
}

const SuccessScreen: React.FC<Props> = ({ theme, onFinish }) => {
  const isDarkMode = theme.background === "#060606";
  const accentColor = isDarkMode ? "#E7E7E7" : "#1497D9";
  const proceedColor = isDarkMode ? "#1CA7ED" : "#1497D9";

  return (
    <View style={styles.container}>
      {/* Background Graphic */}
      <View style={styles.graphicWrapper}>
        <SuccessBoxIcon 
          width={width * 1.2} 
          height={height * 0.65} 
          fill={accentColor} 
          glassFill={theme.background} 
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <View style={styles.textWrapper}>
          <Text style={[styles.successText, { color: theme.text }]}>
            Success!
          </Text>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            Welcome to Aera
          </Text>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedBtn} 
          onPress={onFinish}
          activeOpacity={0.7}
        >
          <Text style={[styles.proceedText, { color: proceedColor }]}>
            Proceed
          </Text>
          <ProceedArrow fill={proceedColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  graphicWrapper: {
    position: "absolute",
    top: -height * 0.1,
    left: width * 0.1,
    zIndex: -1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  textWrapper: {
    marginBottom: 50,
  },
  successText: {
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 68,
    letterSpacing: -2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "700",
  },
  proceedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  proceedText: {
    fontSize: 18,
    fontWeight: "700",
  },
});

export default SuccessScreen;