import React from "react";
import Svg, { Path } from "react-native-svg";

interface MyPresetMenuIconProps {
	color?: string;
	size?: number;
}

const MyPresetMenuIcon = ({
	color = "#E7E7E7",
	size = 12,
}: MyPresetMenuIconProps) => {
	// Maintaining the 13:12 aspect ratio
	const width = (size * 13) / 12;

	return (
		<Svg width={width} height={size} viewBox="0 0 13 12" fill="none">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M0 7.32c0-.416.337-.753.753-.753h10.535a.753.753 0 0 1 0 1.505H.752A.753.753 0 0 1 0 7.32m0-3.284c0-.416.337-.753.753-.753h10.535a.753.753 0 0 1 0 1.505H.752A.753.753 0 0 1 0 4.036M0 .753C0 .337.337 0 .753 0h10.535a.752.752 0 1 1 0 1.505H.752A.753.753 0 0 1 0 .753m0 9.85c0-.415.337-.752.753-.752h10.535a.753.753 0 0 1 0 1.505H.752A.75.75 0 0 1 0 10.603"
				fill={color}
			/>
		</Svg>
	);
};

export default MyPresetMenuIcon;
