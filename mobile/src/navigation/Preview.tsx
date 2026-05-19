import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import ResetIcon from "../components/icons/ResetIcon";
import BookmarkIcon from "../components/icons/BookmarkIcon";

export default function Preview({ theme }: { theme: any }) {
	const isDarkMode =
		theme.background === "#000000" || theme.background === "#1a1a1a";

	return (
		<ScrollView
			contentContainerStyle={[
				styles.content,
				{ backgroundColor: theme.background },
			]}
			keyboardShouldPersistTaps="handled"
		>
			{/* Reset Icon Preview Block */}
			<View style={styles.block}>
				<Text style={[styles.label, { color: theme.text }]}>
					Reset Icon
				</Text>
				<View style={styles.iconRow}>
					<View style={styles.iconContainer}>
						<ResetIcon darkMode={isDarkMode} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Normal
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<ResetIcon darkMode={isDarkMode} disabled={true} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Disabled
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<ResetIcon fill="#FF6B6B" />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Custom
						</Text>
					</View>
				</View>
			</View>

			{/* Bookmark Icon Preview Block */}
			<View style={styles.block}>
				<Text style={[styles.label, { color: theme.text }]}>
					Bookmark Icon
				</Text>
				<View style={styles.iconRow}>
					<View style={styles.iconContainer}>
						<BookmarkIcon darkMode={isDarkMode} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Fill
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<BookmarkIcon darkMode={isDarkMode} outline={true} />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Outline
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<BookmarkIcon fill="#FF6B6B" />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Custom Fill
						</Text>
					</View>
					<View style={styles.iconContainer}>
						<BookmarkIcon outline={true} fill="#4CAF50" />
						<Text style={[styles.iconLabel, { color: theme.text }]}>
							Custom Outline
						</Text>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: 20,
		paddingVertical: 40,
		backgroundColor: "transparent",
		gap: 40,
	},
	block: {
		gap: 16,
		width: "100%",
		alignItems: "center",
	},
	label: {
		fontFamily: "aera_semibold",
		fontSize: 14,
		opacity: 0.6,
		textTransform: "uppercase",
		textAlign: "center",
	},
	iconRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 24,
		marginTop: 8,
	},
	iconContainer: {
		alignItems: "center",
		gap: 8,
	},
	iconLabel: {
		fontFamily: "aera_regular",
		fontSize: 12,
		opacity: 0.7,
	},
});
