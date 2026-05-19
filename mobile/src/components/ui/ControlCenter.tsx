import React, { useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";

import ResetIcon from "../icons/ResetIcon";
import BookmarkIcon from "../icons/BookmarkIcon";

const { width } = Dimensions.get("window");

const CIRCLE_SIZE = 38;

interface Props {
  theme: any;
  onPowerPress?: () => void;
  onResetPress?: () => void;
  onBookmarkPress?: (isBookmarked: boolean) => void;
}

// Control Center background svg
const lightSvg = `<svg width="412" height="153" viewBox="0 0 412 153" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#a)"><path d="M0 73.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z" fill="#e7e7e7"/></g><defs><filter id="a" x="-28.2" y="0" width="468.4" height="152.948" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="14.1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1997_3299"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1997_3299"/><feOffset/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="effect1_dropShadow_1997_3299" result="effect2_dropShadow_1997_3299"/><feBlend in="SourceGraphic" in2="effect2_dropShadow_1997_3299" result="shape"/></filter></defs></svg>`;

const darkSvg = `<svg width="412" height="154" viewBox="0 0 412 154" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#a)"><mask id="b" maskUnits="userSpaceOnUse" x="0" y="28.2" width="412" height="98" fill="#000"><path fill="#fff" d="M0 28.2h412v98H0z"/><path d="M0 74.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z"/></mask><path d="M0 74.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z" fill="#141414" shape-rendering="crispEdges"/><path d="M0 74.2c0-25.405 20.595-46 46-46h320c25.405 0 46 20.595 46 46 0-24.3-20.147-44-45-44H45c-24.853 0-45 19.7-45 44m412 51.548H0zm-412 0V29.2zM412 29.2v96.548z" fill="#d9d9d9" fill-opacity=".5" mask="url(#b)"/></g><defs><filter id="a" x="-28.2" y="0" width="468.4" height="153.948" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="14.1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1997_1155"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1997_1155"/><feOffset/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="effect1_dropShadow_1997_1155" result="effect2_dropShadow_1997_1155"/><feBlend in="SourceGraphic" in2="effect2_dropShadow_1997_1155" result="shape"/></filter></defs></svg>`;

// Power button SVG with shadow - Light mode
const powerButtonLightSvg = `<svg width="76" height="74" viewBox="0 0 76 74" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#buttonShadowLight)">
    <rect x="8" y="7" width="60" height="60" rx="20" fill="#D52222"/>
    <g transform="translate(22, 21)">
      <path d="M15.869 31.738C7.119 31.738 0 24.607 0 15.842c0-4.764 2.079-9.23 5.704-12.248a1.678 1.678 0 1 1 2.149 2.578c-2.857 2.38-4.496 5.905-4.496 9.67 0 6.914 5.613 12.539 12.512 12.539S28.38 22.756 28.38 15.842a12.51 12.51 0 0 0-4.564-9.662 1.679 1.679 0 1 1 2.136-2.588 15.86 15.86 0 0 1 5.785 12.25c0 8.765-7.119 15.896-15.868 15.896" fill="#fff"/>
      <path d="M15.868 17.09a1.68 1.68 0 0 1-1.678-1.68V1.679a1.679 1.679 0 0 1 3.357 0v13.733a1.68 1.68 0 0 1-1.679 1.678" fill="#fff"/>
    </g>
  </g>
  <defs>
    <filter id="buttonShadowLight" x="-4" y="-1" width="84" height="82" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.30"/>
    </filter>
  </defs>
</svg>`;

// Power button SVG with shadow - Dark mode
const powerButtonDarkSvg = `<svg width="76" height="74" viewBox="0 0 76 74" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#buttonShadowDark)">
    <rect x="8" y="7" width="60" height="60" rx="20" fill="#141414" stroke="rgba(217, 217, 217, 0.50)" stroke-width="1"/>
    <g transform="translate(22, 21)">
      <path d="M15.869 31.738C7.119 31.738 0 24.607 0 15.842c0-4.764 2.079-9.23 5.704-12.248a1.678 1.678 0 1 1 2.149 2.578c-2.857 2.38-4.496 5.905-4.496 9.67 0 6.914 5.613 12.539 12.512 12.539S28.38 22.756 28.38 15.842a12.51 12.51 0 0 0-4.564-9.662 1.679 1.679 0 1 1 2.136-2.588 15.86 15.86 0 0 1 5.785 12.25c0 8.765-7.119 15.896-15.868 15.896" fill="#d52222"/>
      <path d="M15.868 17.09a1.68 1.68 0 0 1-1.678-1.68V1.679a1.679 1.679 0 0 1 3.357 0v13.733a1.68 1.68 0 0 1-1.679 1.678" fill="#d52222"/>
    </g>
  </g>
  <defs>
    <filter id="buttonShadowDark" x="-4" y="-1" width="84" height="82" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.30"/>
    </filter>
  </defs>
</svg>`;

const ControlCenter: React.FC<Props> = ({
  theme,
  onPowerPress,
  onResetPress,
  onBookmarkPress,
}) => {
  const isDarkMode = theme?.background === "#060606";
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkPress = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    onBookmarkPress?.(newBookmarkState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.svgBackground}>
        <SvgXml
          xml={isDarkMode ? darkSvg : lightSvg}
          width="100%"
          height="100%"
        />
      </View>

      <View style={styles.buttonContainer}>
        {/* Reset Button */}
        <TouchableOpacity
          key={`reset-${isDarkMode}`}
          onPress={onResetPress}
          activeOpacity={0.7}
          style={[
            styles.circleButton,
            isDarkMode ? styles.circleButtonDark : styles.circleButtonLight,
          ]}
        >
          <ResetIcon darkMode={isDarkMode} width={18} height={18} />
        </TouchableOpacity>

        {/* Main Power Button */}
        <TouchableOpacity
          onPress={onPowerPress}
          activeOpacity={0.7}
          style={styles.powerButtonWrapper}
        >
          <SvgXml
            xml={isDarkMode ? powerButtonDarkSvg : powerButtonLightSvg}
            width={76}
            height={74}
          />
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          key={`bookmark-${isDarkMode}`}
          onPress={handleBookmarkPress}
          activeOpacity={0.7}
          style={[
            styles.circleButton,
            isDarkMode ? styles.circleButtonDark : styles.circleButtonLight,
          ]}
        >
          <BookmarkIcon
            darkMode={isDarkMode}
            outline={!isBookmarked}
            width={13}
            height={18}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 145,
    alignSelf: "center",
    // FIX: Pulls the navigation bar up to collapse the asset's transparent padding zone
    marginBottom: -30, 
  },
  svgBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    // FIX: Shifted down slightly to account for the layout pull-down adjustment
    marginTop: 36, 
    zIndex: 1,
  },
  powerButtonWrapper: {
    width: 76,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButton: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonLight: {
    backgroundColor: "#E7E7E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  circleButtonDark: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "rgba(217, 217, 217, 0.50)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default ControlCenter;