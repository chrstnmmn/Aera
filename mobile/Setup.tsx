import React, { useState } from "react";
import {
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Screens & Components
import PagerIndicator from "./PagerIndicator";
import WelcomeScreen from "./WelcomeScreen";
import PowerUpScreen from "./PowerUpScreen";
import BluetoothScreen from "./BluetoothScreen";
import WifiSetupScreen from "./WifiSetupScreen";
import GoBackIcon from "./GoBackIcon";

const Setup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const isDarkMode = useColorScheme() === "dark";

  const theme = {
    background: isDarkMode ? "#060606" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#2E2E2E",
    primaryBlue: "#00A0E9",
    boxGraphic: isDarkMode ? "#E7E7E7" : "#00A0E9",
    pillInactive: isDarkMode ? "#333333" : "#D9D9D9",
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* HEADER SECTION - Now Fixed Center */}
      <View style={styles.headerContainer}>
        {/* Absolute positioned button so it doesn't push the dots */}
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <GoBackIcon fill={theme.text} />
            <Text style={[styles.backBtnText, { color: theme.text }]}>
              {currentStep === 3 ? "Cancel" : "Go Back"}
            </Text>
          </TouchableOpacity>
        )}

        {/* This will now always stay in the true center of the screen */}
        <PagerIndicator step={currentStep} theme={theme} totalSteps={4} />
      </View>

      {/* SCREEN ROUTER */}
      <View style={styles.screenContainer}>
        {currentStep === 0 && (
          <WelcomeScreen theme={theme} onNext={() => setCurrentStep(1)} />
        )}

        {currentStep === 1 && (
          <PowerUpScreen theme={theme} onNext={() => setCurrentStep(2)} />
        )}

        {currentStep === 2 && (
          <BluetoothScreen theme={theme} onNext={() => setCurrentStep(3)} />
        )}

        {currentStep === 3 && (
          <WifiSetupScreen
            theme={theme}
            onNext={() => console.log("Setup Complete!")}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 60,
    width: "100%",
    // These two lines ensure the PagerIndicator is perfectly centered
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    // Absolute positioning removes the button from the Flexbox calculations
    position: "absolute",
    left: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 10, // Ensure it stays clickable on top of other layers
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "System",
  },
  screenContainer: {
    flex: 1,
  },
});

export default Setup;
