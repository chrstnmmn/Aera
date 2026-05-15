import React from "react";
import Svg, { Path } from "react-native-svg";

interface CloudConnectedIconTitleBarProps {
	color?: string;
	size?: number;
}

const CloudConnectedIconTitleBar = ({
	color = "#2E2E2E",
	size = 11,
}: CloudConnectedIconTitleBarProps) => {
	// Maintaining the 15:11 aspect ratio
	const width = (size * 15) / 11;

	return (
		<Svg width={width} height={size} viewBox="0 0 15 11" fill="none">
			<Path
				d="M12.205 4.234a.46.46 0 0 1-.348-.356c-.221-1.055-.703-1.96-1.415-2.645A4.42 4.42 0 0 0 7.362 0a4.18 4.18 0 0 0-2.723.972c-.52.439-.932.99-1.208 1.61a.46.46 0 0 1-.327.263c-.776.162-1.468.5-1.99.974C.386 4.483 0 5.39 0 6.441c0 1.036.414 1.981 1.164 2.663.724.657 1.699 1.018 2.747 1.018h7.476c.931 0 1.732-.246 2.318-.712.666-.53 1.018-1.318 1.018-2.278 0-1.656-1.208-2.605-2.518-2.898m-2.737-.257-3.1 3.681a.46.46 0 0 1-.345.164h-.008a.46.46 0 0 1-.342-.152l-1.32-1.463a.47.47 0 0 1 .009-.644.46.46 0 0 1 .666.018l.975 1.08 2.76-3.278a.46.46 0 1 1 .704.593z"
				fill={color}
			/>
		</Svg>
	);
};

export default CloudConnectedIconTitleBar;
