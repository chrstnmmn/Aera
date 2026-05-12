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
  ActivityIndicator,
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
  // --- STATE ---
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // --- THEME & STYLING HELPERS ---
  const isDarkMode = theme.background === "#060606";
  const inputBgColor = isDarkMode ? "#141414" : "#DEDEDE";
  const placeholderTextColor = isDarkMode ? "#666666" : "#888888";
  const blueButtonBg = isDarkMode ? "#1CA7ED" : "#1497D9";
  const disabledBg = isDarkMode ? "#222222" : "#CCCCCC";

  const isFormIncomplete =
    ssid.trim().length === 0 || password.trim().length === 0;

  const getBorderColor = (id: string) => {
    if (focusedInput === id) return theme.primaryBlue;
    return isDarkMode ? "rgba(217, 217, 217, 0.50)" : "transparent";
  };

  // --- MOCK CONNECTION LOGIC ---
  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      if (onNext) onNext();
    }, 2000);
  };

  return (
    <>
      <View style={styles.wifiGraphicWrapper} pointerEvents="none">
        <WizardWifiIcon
          width={width * 1.5}
          height={height * 0.4}
          fill={theme.boxGraphic}
        />
      </View>

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
          {/* SSID Input */}
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
                editable={!isConnecting}
              />
            </View>
          </View>

          {/* Password Input */}
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
                // --- FIX: Explicitly set the secure state ---
                secureTextEntry={isPasswordVisible ? false : true}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                editable={!isConnecting}
                textContentType="password" // Helps Android handle secure fields better
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
              {
                backgroundColor:
                  isFormIncomplete || isConnecting ? disabledBg : blueButtonBg,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleConnect}
            disabled={isFormIncomplete || isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color={isDarkMode ? "#666666" : "#E7E7E7"} />
            ) : (
              <Text
                style={[
                  styles.connectBtnText,
                  { color: isFormIncomplete ? "#666666" : "#E7E7E7" },
                ]}
              >
                Connect to Router
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

// ... styles stay the same as your previous version
const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  wifiGraphicWrapper: {
    position: "absolute",
    top: height * 0.7, 
    left: -width * 0.3,
    transform: [{ rotate: "7deg" }],
    zIndex: -1,
  },
  headerSection: { marginTop: height * 0.02, alignItems: "flex-end" },
  titleText: {
    fontFamily: "SFPro-Black",
    fontSize: 40,
    textAlign: "right",
  },
  subtitleWrapper: { width: "100%", alignItems: "flex-end", marginTop: -16 },
  subtitleText: {
    fontFamily: "SFPro-Medium",
    fontSize: 16,
    textAlign: "right",
    width: "75%",
  },
  formSection: { flex: 1, marginTop: height * 0.05 },
  inputGroup: { marginBottom: 10 },
  label: {
    fontFamily: "SFPro-Heavy",
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    width: "100%",
    height: 55,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderStyle: "solid",
  },
  input: { flex: 1, fontFamily: "SFPro-Regular", fontSize: 18, height: "100%" },
  eyeIconWrapper: { padding: 10, marginLeft: 10 },
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
      android: { elevation: 4 },
    }),
  },
  connectBtnText: { fontFamily: "SFPro-Heavy", fontSize: 20, },
});

export default WifiSetupScreen;
