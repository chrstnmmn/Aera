import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
	width?: number | string;
	height?: number | string;
	fill?: string;
}

const ActiveDryingSunIcon: React.FC<Props> = ({
	width = 38,
	height = 20,
	fill = "#2E2E2E",
}) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 38 20" fill="none">
			<Path
				d="M18.52 0a1.16 1.16 0 0 1 1.157 1.157v4.63a1.157 1.157 0 1 1-2.315 0v-4.63A1.157 1.157 0 0 1 18.52 0m18.52 18.52a1.157 1.157 0 0 1-1.158 1.157h-4.63a1.157 1.157 0 1 1 0-2.315h4.63a1.157 1.157 0 0 1 1.157 1.158M5.786 19.677a1.157 1.157 0 1 0 0-2.315h-4.63a1.157 1.157 0 1 0 0 2.315zM31.615 5.424a1.157 1.157 0 0 1 0 1.637l-3.273 3.273a1.16 1.16 0 0 1-1.904-.366 1.16 1.16 0 0 1 .267-1.27l3.274-3.274a1.157 1.157 0 0 1 1.636 0m-22.918 4.91a1.157 1.157 0 0 0 1.637-1.637L7.061 5.424A1.158 1.158 0 1 0 5.424 7.06zM18.52 9.26a9.26 9.26 0 0 0-9.26 9.26 1.16 1.16 0 0 0 1.157 1.157h16.205a1.157 1.157 0 0 0 1.157-1.157 9.26 9.26 0 0 0-9.26-9.26"
				fill={fill}
			/>
		</Svg>
	);
};

export default ActiveDryingSunIcon;
