import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
	width?: number | string;
	height?: number | string;
	fill?: string;
}

const ChamberTempIcon: React.FC<Props> = ({
	width = 7,
	height = 15,
	fill = "#2E2E2E",
}) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 7 15" fill="none">
			<Path
				d="M5.5 8.474V2.03C5.5 0.932 4.63.017 3.532 0A2.003 2.003 0 0 0 1.5 2v6.474a.25.25 0 0 1-.1.199A3.55 3.55 0 0 0 0 11.5a3.5 3.5 0 0 0 7 0 3.55 3.55 0 0 0-1.4-2.827.25.25 0 0 1-.1-.2M3.44 13a1.5 1.5 0 0 1-.688-2.799.5.5 0 0 0 .25-.432V3.013c0-.27.207-.5.476-.514A.5.5 0 0 1 4 3v6.769a.5.5 0 0 0 .255.435A1.5 1.5 0 0 1 3.44 13"
				fill={fill}
			/>
		</Svg>
	);
};

export default ChamberTempIcon;
