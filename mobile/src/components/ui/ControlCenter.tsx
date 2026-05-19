import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SvgXml } from "react-native-svg";

const { width } = Dimensions.get("window");

interface Props {
	theme: any;
}

const lightSvg = `<svg width="412" height="153" viewBox="0 0 412 153" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#a)"><path d="M0 73.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z" fill="#e7e7e7"/></g><defs><filter id="a" x="-28.2" y="0" width="468.4" height="152.948" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="14.1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1997_3299"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1997_3299"/><feOffset/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="effect1_dropShadow_1997_3299" result="effect2_dropShadow_1997_3299"/><feBlend in="SourceGraphic" in2="effect2_dropShadow_1997_3299" result="shape"/></filter></defs></svg>`;

const darkSvg = `<svg width="412" height="154" viewBox="0 0 412 154" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#a)"><mask id="b" maskUnits="userSpaceOnUse" x="0" y="28.2" width="412" height="98" fill="#000"><path fill="#fff" d="M0 28.2h412v98H0z"/><path d="M0 74.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z"/></mask><path d="M0 74.2c0-24.853 20.147-45 45-45h322c24.853 0 45 20.147 45 45v51.548H0z" fill="#141414" shape-rendering="crispEdges"/><path d="M0 74.2c0-25.405 20.595-46 46-46h320c25.405 0 46 20.595 46 46 0-24.3-20.147-44-45-44H45c-24.853 0-45 19.7-45 44m412 51.548H0zm-412 0V29.2zM412 29.2v96.548z" fill="#d9d9d9" fill-opacity=".5" mask="url(#b)"/></g><defs><filter id="a" x="-28.2" y="0" width="468.4" height="153.948" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset/><feGaussianBlur stdDeviation="14.1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1997_1155"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1997_1155"/><feOffset/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="effect1_dropShadow_1997_1155" result="effect2_dropShadow_1997_1155"/><feBlend in="SourceGraphic" in2="effect2_dropShadow_1997_1155" result="shape"/></filter></defs></svg>`;

const ControlCenter: React.FC<Props> = ({ theme }) => {
	const isDarkMode = theme?.background === "#060606";

	return (
		<View style={styles.container}>
			<View style={styles.svgBackground}>
				<SvgXml
					xml={isDarkMode ? darkSvg : lightSvg}
					width="100%"
					height="100%"
				/>
			</View>

			<View style={styles.buttonContainer}>{/* Buttons go here */}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: width,
		height: 154,
		alignSelf: "center",
		// Removed absolute positioning – parent wrapper handles it
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
		gap: 30,
		marginTop: 40,
		zIndex: 1,
	},
});

export default ControlCenter;
