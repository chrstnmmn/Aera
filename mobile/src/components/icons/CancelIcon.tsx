import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
	width?: number | string;
	height?: number | string;
	fill?: string;
}

const CancelIcon: React.FC<Props> = ({
	width = 15,
	height = 15,
	fill = "#fff",
}) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 15 15" fill="none">
			<Path
				d="m8.332 7.3 2.066-2.064a.73.73 0 0 0-1.033-1.033L7.3 6.268 5.236 4.203a.73.73 0 1 0-1.033 1.033L6.268 7.3 4.203 9.365a.73.73 0 0 0 1.033 1.033L7.3 8.332l2.065 2.066a.73.73 0 0 0 1.033-1.033zM7.3 14.6A7.3 7.3 0 1 1 7.3 0a7.3 7.3 0 0 1 0 14.6"
				fill={fill}
			/>
		</Svg>
	);
};

export default CancelIcon;
