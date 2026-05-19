import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
	width?: number | string;
	height?: number | string;
	fill?: string;
	disabled?: boolean;
	darkMode?: boolean;
}

const ResetIcon: React.FC<Props> = ({
	width = 18,
	height = 18,
	fill,
	disabled = false,
	darkMode = false,
}) => {
	// Determine the fill color based on props
	const getFillColor = () => {
		if (fill) return fill; // Allow custom fill to override everything

		if (disabled) {
			return darkMode ? "#a1a1a1" : "#363636";
		}

		return darkMode ? "#e7e7e7" : "#2e2e2e";
	};

	// Set opacity for disabled state
	const getFillOpacity = () => {
		if (disabled) {
			return darkMode ? 0.75 : 0.5;
		}
		return undefined; // No opacity for normal state
	};

	return (
		<Svg
			width={width}
			height={height}
			viewBox="0 0 18 18"
			fill="none"
			accessibilityLabel="Reset icon"
			accessible={true}
		>
			<Path
				d="M8.696 0C3.901 0 0 3.901 0 8.696s3.901 8.697 8.696 8.697 8.697-3.902 8.697-8.697S13.49 0 8.696 0m5.017 7.616a.36.36 0 0 1-.36.36h-2.49a.36.36 0 0 1-.254-.615l.927-.927-.234-.272a3.653 3.653 0 1 0 .814 3.752.67.67 0 1 1 1.263.446A4.991 4.991 0 1 1 8.67 3.705a4.95 4.95 0 0 1 3.611 1.545l.023.026.18.209.614-.614a.35.35 0 0 1 .39-.08.36.36 0 0 1 .224.335z"
				fill={getFillColor()}
				fillOpacity={getFillOpacity()}
			/>
		</Svg>
	);
};

export default React.memo(ResetIcon);
