import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
	theme: any;
}

export default function Preview({ theme }: Props) {
	return (
		<View style={styles.content}>
			{/* 
        BUILD YOUR COMPONENTS HERE!
        This screen has full access to your custom Aera fonts and themes.
      */}
			<Text style={[styles.massiveText, { color: theme.text }]}>
				Hello
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	massiveText: {
		fontFamily: "aera_black",
		fontWeight: "normal",
		fontSize: 50,
		letterSpacing: -1.5,
	},
});
