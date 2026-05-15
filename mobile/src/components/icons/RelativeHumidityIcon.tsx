import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
	width?: number | string;
	height?: number | string;
	fill?: string;
}

const RelativeHumidityIcon: React.FC<Props> = ({
	width = 11,
	height = 15,
	fill = "#2E2E2E",
}) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 11 15" fill="none">
			<Path
				d="M5.628.154a.44.44 0 0 0-.67 0C3.795 1.515 0 6.221 0 9.707 0 12.955 2.045 15 5.293 15s5.293-2.045 5.293-5.293c0-3.486-3.794-8.192-4.958-9.553m.253 12.935a.442.442 0 1 1 .003-.883 2.21 2.21 0 0 0 2.203-2.202.437.437 0 0 1 .502-.44.44.44 0 0 1 .38.437 3.09 3.09 0 0 1-3.088 3.088"
				fill={fill}
			/>
		</Svg>
	);
};

export default RelativeHumidityIcon;
