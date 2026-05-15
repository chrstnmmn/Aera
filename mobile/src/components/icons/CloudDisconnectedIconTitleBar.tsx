import React from "react";
import Svg, { Path } from "react-native-svg";

interface CloudDisconnectedIconTitleBarProps {
	color?: string;
	size?: number;
}

const CloudDisconnectedIconTitleBar = ({
	color = "#2E2E2E",
	size = 12,
}: CloudDisconnectedIconTitleBarProps) => {
	// Maintaining the 14:12 aspect ratio
	const width = (size * 14) / 12;

	return (
		<Svg width={width} height={size} viewBox="0 0 14 12" fill="none">
			<Path
				d="M11.983 11.12a.42.42 0 0 1-.303-.126L1.41.723a.428.428 0 0 1 .604-.605l10.271 10.27a.428.428 0 0 1-.302.731M1.036 3.971C.358 4.59 0 5.433 0 6.411c0 .963.385 1.843 1.083 2.477.673.61 1.58.947 2.555.947h5.157a.214.214 0 0 0 .151-.365L2.698 3.222a.21.21 0 0 0-.214-.053 3.8 3.8 0 0 0-1.448.802m11.712 5.202c.62-.494.947-1.226.947-2.12 0-1.54-1.124-2.422-2.342-2.694a.43.43 0 0 1-.324-.332c-.206-.98-.654-1.823-1.316-2.46A4.1 4.1 0 0 0 6.847.42c-.832 0-1.608.24-2.263.698a.214.214 0 0 0-.03.328l7.795 7.795a.214.214 0 0 0 .273.025 2 2 0 0 0 .126-.093"
				fill={color}
			/>
		</Svg>
	);
};

export default CloudDisconnectedIconTitleBar;
