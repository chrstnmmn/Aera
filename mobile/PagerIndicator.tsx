import React from "react";
import { StyleSheet, View } from "react-native";

interface PagerProps {
	step: number;
	theme: any;
}

const PagerIndicator: React.FC<PagerProps> = ({ step, theme }) => {
	return (
		<View style={styles.indicatorContainer}>
			{[0, 1, 2, 3].map((index) => (
				<View
					key={index}
					style={[
						styles.pill,
						{
							backgroundColor:
								index === step
									? theme.primaryBlue
									: theme.pillInactive,
						},
						index === step && styles.pillActiveWidth,
					]}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	indicatorContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 20,
		gap: 8,
	},
	pill: { height: 8, width: 8, borderRadius: 4 },
	pillActiveWidth: { width: 24 },
});

export default PagerIndicator;
