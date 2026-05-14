import React from "react";
import Svg, { Path } from "react-native-svg";

interface AeraIconProps {
	color?: string;
	size?: number;
}

const AeraIcon = ({ color = "#2E2E2E", size = 21 }: AeraIconProps) => {
	// We calculate the width based on the original 19:21 aspect ratio
	const width = (size * 19) / 21;

	return (
		<Svg width={width} height={size} viewBox="0 0 19 21" fill="none">
			<Path
				d="M10.498 19.683a1.312 1.312 0 0 0 1.899 1.174l5.249-2.624c.444-.223.725-.677.725-1.174V9.495a1.312 1.312 0 0 0-1.899-1.173l-5.249 2.624a1.31 1.31 0 0 0-.725 1.174zm5.526-14.071a1.312 1.312 0 0 0 0-2.348L9.772.14a1.31 1.31 0 0 0-1.173 0L2.347 3.264a1.312 1.312 0 0 0 0 2.348L8.6 8.737c.37.185.804.185 1.173 0zM1.9 8.322A1.312 1.312 0 0 0 0 9.495v7.564c0 .497.28.951.725 1.174l5.25 2.624a1.312 1.312 0 0 0 1.898-1.174V12.12c0-.497-.28-.952-.725-1.174z"
				fill={color}
			/>
		</Svg>
	);
};

export default AeraIcon;
