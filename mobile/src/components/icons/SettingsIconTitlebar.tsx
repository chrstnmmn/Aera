import React from "react";
import Svg, { Path } from "react-native-svg";

interface SettingsIconTitlebarProps {
	color?: string;
	size?: number;
}

const SettingsIconTitlebar = ({
	color = "#2E2E2E",
	size = 14,
}: SettingsIconTitlebarProps) => {
	// Maintaining the 24:14 aspect ratio
	const width = (size * 24) / 14;

	return (
		<Svg width={width} height={size} viewBox="0 0 24 14" fill="none">
			<Path
				d="M17.25 0H6.75A6.76 6.76 0 0 0 0 6.75a6.76 6.76 0 0 0 6.75 6.75h10.5A6.76 6.76 0 0 0 24 6.75 6.76 6.76 0 0 0 17.25 0m0 12a5.25 5.25 0 1 1 0-10.499 5.25 5.25 0 0 1 0 10.499"
				fill={color}
			/>
		</Svg>
	);
};

export default SettingsIconTitlebar;
