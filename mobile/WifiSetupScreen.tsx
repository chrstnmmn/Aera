import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// Assets
import WizardWifiIcon from "./WizardWifiIcon";
import EyeVisibleIcon from "./EyeVisibleIcon";
import EyeHiddenIcon from "./EyeHiddenIcon";

const { width, height } = Dimensions.get("window");

interface Props {
  theme: any;
  onNext?: () => void;
}

const WifiSetupScreen: React.FC<Props> = ({ theme, onNext }) => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Helper to get dynamic border color
  const getBorderColor = (id: string) => {
    if (focusedInput === id) return theme.primaryBlue;
    return isDarkMode ? "rgba(217, 217, 217, 0.50)" : "transparent";
  };

  const isFormIncomplete =
    ssid.trim().length === 0 || password.trim().length === 0;

  const isDarkMode = theme.background === "#060606";
  const inputBgColor = isDarkMode ? "#141414" : "#DEDEDE";
  const inputBorderColor = isDarkMode
    ? "rgba(217, 217, 217, 0.50)"
    : "transparent";
  const placeholderTextColor = isDarkMode ? "#666666" : "#888888";

  const blueButtonBg = isDarkMode ? "#1CA7ED" : "#1497D9";
  const disabledBg = isDarkMode ? "#222222" : "#CCCCCC";

  return (
    // 1. Fragment wraps everything to allow layered positioning
    <>
      {/* 2. BACKGROUND LAYER: This stays pinned to the bottom and won't move */}
      <View style={styles.wifiGraphicWrapper} pointerEvents="none">
        <WizardWifiIcon
          width={width * 1.5}
          height={height * 0.4}
          fill={theme.boxGraphic}
        />
      </View>

      {/* 3. INTERACTIVE LAYER: Only this part responds to the keyboard */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.headerSection}>
          <Text style={[styles.titleText, { color: theme.text }]}>
            Setup your Aera
          </Text>
          <View style={styles.subtitleWrapper}>
            <Text style={[styles.subtitleText, { color: theme.text }]}>
              Complete the setup below to be able to use the app
            </Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>SSID</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: inputBgColor,
                  borderColor: getBorderColor("ssid"),
                  borderWidth: isDarkMode || focusedInput === "ssid" ? 2 : 0,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="HUAWEI-2.4G-ZxPH"
                placeholderTextColor={placeholderTextColor}
                value={ssid}
                onChangeText={setSsid}
                onFocus={() => setFocusedInput("ssid")}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: inputBgColor,
                  borderColor: getBorderColor("password"),
                  borderWidth:
                    isDarkMode || focusedInput === "password" ? 2 : 0,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your password"
                placeholderTextColor={placeholderTextColor}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {password.length > 0 && (
                <TouchableOpacity
                  style={styles.eyeIconWrapper}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  activeOpacity={0.7}
                >
                  {isPasswordVisible ? (
                    <EyeVisibleIcon width={22} height={16} fill={theme.text} />
                  ) : (
                    <EyeHiddenIcon width={22} height={17} fill={theme.text} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.connectBtn,
              { backgroundColor: isFormIncomplete ? disabledBg : blueButtonBg },
            ]}
            activeOpacity={0.8}
            onPress={onNext}
            disabled={isFormIncomplete}
          >
            <Text
              style={[
                styles.connectBtnText,
                { color: isFormIncomplete ? "#666666" : "#E7E7E7" },
              ]}
            >
              Connect to Router
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    backgroundColor: "transparent", // Ensure it doesn't block the background
  },
  wifiGraphicWrapper: {
    position: "absolute",
    // We pin it relative to the true bottom of the screen
    bottom: -height * 0.1,
    left: -width * 0.3,
    transform: [{ rotate: "7deg" }],
    zIndex: -1,
  },
  headerSection: {
    marginTop: height * 0.02,
    alignItems: "flex-end",
  },
  titleText: {
    fontFamily: "System",
    fontSize: 40,
    fontWeight: "900",
    textAlign: "right",
  },
  subtitleWrapper: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 8,
  },
  subtitleText: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
    width: "75%",
    lineHeight: 21,
  },
  formSection: {
    flex: 1,
    marginTop: height * 0.05,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    width: "100%",
    height: 55,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontFamily: "System",
    fontSize: 18,
    height: "100%",
  },
  eyeIconWrapper: {
    padding: 10,
    marginLeft: 10,
  },
  connectBtn: {
    width: "100%",
    height: 55,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  connectBtnText: {
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "700",
  },
});

export default WifiSetupScreen;
