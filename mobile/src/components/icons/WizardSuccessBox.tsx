import React from "react";
import Svg, { Path } from "react-native-svg";

interface WizardBoxProps {
	width?: number | string;
	height?: number | string;
	primaryFill?: string;
	glassFill?: string;
}

const WizardSuccessBox: React.FC<WizardBoxProps> = ({
	width = 289,
	height = 622,
	primaryFill = "#1497D9",
	glassFill = "#FFFFFF",
}) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 289 622" fill="none">
			{/* Right side of the box */}
			<Path
				d="M68.6929 1052.87C68.6929 1067.57 84.6691 1076.7 97.335 1069.24L279.125 962.178C284.923 958.763 288.483 952.535 288.483 945.806L288.483 164.448C288.483 149.784 272.576 140.647 259.91 148.036L78.1199 254.072C72.2825 257.477 68.693 263.727 68.693 270.484L68.6929 1052.87Z"
				fill={primaryFill}
			/>
			{/* The "Glass" / Background cutout */}
			<Path
				d="M90.5186 938.276C90.5186 945.239 98.0862 949.565 104.086 946.031L267.159 849.988C269.906 848.37 271.592 845.421 271.592 842.233L271.592 183.128C271.592 176.182 264.057 171.854 258.057 175.354L94.9841 270.473C92.219 272.086 90.5187 275.046 90.5187 278.247L90.5186 938.276Z"
				fill={glassFill}
			/>
			{/* Left side of the box */}
			<Path
				d="M66.6929 1052.87C66.6929 1067.57 50.7167 1076.7 38.0507 1069.24L-143.739 962.178C-149.538 958.763 -153.097 952.535 -153.097 945.806V164.448C-153.097 149.784 -137.191 140.647 -124.524 148.036L57.2659 254.072C63.1033 257.477 66.6929 263.727 66.6929 270.484V1052.87Z"
				fill={primaryFill}
			/>
			{/* Top lid of the box */}
			<Path
				d="M259.348 144.623C271.917 137.291 271.917 119.131 259.348 111.799L77.2664 5.58457C71.3505 2.13363 64.0352 2.13364 58.1193 5.58457L-123.963 111.799C-136.531 119.131 -136.531 137.291 -123.963 144.623L58.1193 250.837C64.0352 254.288 71.3505 254.288 77.2664 250.837L259.348 144.623Z"
				fill={primaryFill}
			/>
		</Svg>
	);
};

export default WizardSuccessBox;
