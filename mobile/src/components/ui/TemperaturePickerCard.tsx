import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

interface Props {
  theme: any;
}

export interface TemperaturePickerRef {
  getValue: () => number;
  reset: () => void;
}

const DecreaseIcon = ({
  bgFill,
  iconFill,
}: {
  bgFill: string;
  iconFill: string;
}) => (
  <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
    <Rect x={11} y={7} width={50} height={50} rx={20} fill={bgFill} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26 32C26 30.8954 26.6396 30 27.4286 30L44.5714 30C45.3604 30 46 30.8954 46 32C46 33.1046 45.3604 34 44.5714 34L27.4286 34C26.6396 34 26 33.1046 26 32Z"
      fill={iconFill}
    />
  </Svg>
);

const IncreaseIcon = ({
  bgFill,
  iconFill,
}: {
  bgFill: string;
  iconFill: string;
}) => (
  <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
    <Rect x={11} y={7} width={50} height={50} rx={20} fill={bgFill} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M36 22C36.789 22 37.4286 22.6396 37.4286 23.4286V30.5714H44.5714C45.3604 30.5714 46 31.211 46 32C46 32.789 45.3604 33.4286 44.5714 33.4286H37.4286V40.5714C37.4286 41.3604 36.789 42 36 42C35.211 42 34.5714 41.3604 34.5714 40.5714V33.4286H27.4286C26.6396 33.4286 26 32.789 26 32C26 31.211 26.6396 30.5714 27.4286 30.5714L34.5714 30.5714V23.4286C34.5714 22.6396 35.211 22 36 22Z"
      fill={iconFill}
    />
  </Svg>
);

const TemperaturePickerCard = forwardRef<TemperaturePickerRef, Props>(({ theme }, ref) => {
  const isDarkMode = theme?.background === "#060606";

  const [tempVal, setTempVal] = useState("20");
  const [isFocused, setIsFocused] = useState(false);

  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return parseInt(tempVal, 10) || 50;
    },
    reset: () => {
      setTempVal("20");
    },
  }), [tempVal]);

  const baseBg = isDarkMode ? "#141414" : "#E7E7E7";
  const focalBg = isDarkMode ? "#E7E7E7" : "#2E2E2E";
  const titleColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";
  const activeNumberColor = isDarkMode ? "#2E2E2E" : "#FFFFFF";

  useEffect(() => {
    return () => stopHoldAction();
  }, []);

  const decrementValue = () => {
    setTempVal((prev) => {
      const currentTemp = parseInt(prev || "0", 10);
      if (currentTemp > 20) return String(currentTemp - 1);
      return "20";
    });
  };

  const incrementValue = () => {
    setTempVal((prev) => {
      const currentTemp = parseInt(prev || "0", 10);
      if (currentTemp < 100) return String(currentTemp + 1);
      return "100";
    });
  };

  const startHoldingDecrease = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(decrementValue, 50);
  };

  const startHoldingIncrease = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(incrementValue, 50);
  };

  const stopHoldAction = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleTempChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const num = parseInt(digits, 10) || 0;

    if (num === 0 && digits === "") {
      setTempVal("");
      return;
    }

    if (num > 100) {
      setTempVal("100");
    } else {
      setTempVal(num.toString());
    }
  };

  const handleFocus = (val: string, setter: (val: string) => void) => {
    const num = parseInt(val, 10) || 0;
    if (num === 0) {
      setter("");
    } else {
      setter(num.toString());
    }
  };

  const handleBlur = (val: string, setter: (val: string) => void) => {
    const num = parseInt(val, 10) || 0;

    if (num < 20) {
      setter("20");
    } else if (num > 100) {
      setter("100");
    } else {
      setter(num.toString());
    }
  };

  const getDisplayText = (val: string) => {
    if (val === "") {
      return "20";
    }
    return val;
  };

  return (
    <View
      style={[
        styles.baseCard,
        { backgroundColor: baseBg },
        isDarkMode && styles.darkBorder,
      ]}
      key={isDarkMode ? "temppicker-dark" : "temppicker-light"}
    >
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: titleColor }]}>
          Set Heat (°C)
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <Pressable
          onPress={decrementValue}
          onLongPress={startHoldingDecrease}
          onPressOut={stopHoldAction}
          delayLongPress={300}
          style={styles.controlButton}
        >
          <DecreaseIcon
            bgFill={focalBg}
            iconFill={activeNumberColor}
          />
        </Pressable>

        <View style={[styles.focalBox, { backgroundColor: focalBg }]}>
          <View style={styles.inputWrapper}>
            <Text
              style={[
                styles.mainNumberInput,
                styles.visibleDisplay,
                { color: activeNumberColor },
              ]}
            >
              {getDisplayText(tempVal)}
            </Text>

            <TextInput
              style={[
                styles.mainNumberInput,
                styles.hiddenInput,
                { color: "transparent", opacity: 0 },
              ]}
              value={tempVal}
              onChangeText={handleTempChange}
              onFocus={() => {
                handleFocus(tempVal, setTempVal);
                setIsFocused(true);
              }}
              onBlur={() => {
                handleBlur(tempVal, setTempVal);
                setIsFocused(false);
              }}
              keyboardType="number-pad"
              selectTextOnFocus={true}
              autoCorrect={false}
              spellCheck={false}
              scrollEnabled={false}
              multiline={false}
              maxLength={3}
              caretHidden={true}
              selectionColor="transparent"
            />
          </View>
        </View>

        <Pressable
          onPress={incrementValue}
          onLongPress={startHoldingIncrease}
          onPressOut={stopHoldAction}
          delayLongPress={300}
          style={styles.controlButton}
        >
          <IncreaseIcon
            bgFill={focalBg}
            iconFill={activeNumberColor}
          />
        </Pressable>
      </View>
    </View>
  );
});

TemperaturePickerCard.displayName = 'TemperaturePickerCard';

const styles = StyleSheet.create({
  baseCard: {
    width: "100%",
    height: 217.27,
    borderRadius: 20,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
  },
  titleContainer: {
    height: 48,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  focalBox: {
    minWidth: 140,
    paddingHorizontal: 10,
    height: 165,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  inputWrapper: {
    height: 160,
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  visibleDisplay: {
    pointerEvents: "none",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontFamily: "aera_heavy",
    fontSize: 16,
    lineHeight: 21,
    includeFontPadding: false,
    paddingBottom: 15,
  },
  mainNumberInput: {
    fontFamily: "aera_tallcompressed",
    fontSize: 140,
    lineHeight: 140,
    height: 140,
    minWidth: 120,
    textAlignVertical: "center",
    includeFontPadding: false,
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
});

export default TemperaturePickerCard;