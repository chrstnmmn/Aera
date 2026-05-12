import React from "react";
import Svg, { Path } from "react-native-svg";

interface WifiIconProps {
	level: 1 | 2 | 3 | 4; // 1: Full, 2: Med, 3: Low, 4: Disconnected
	theme: any;
}

const WifiIcon: React.FC<WifiIconProps> = ({ level, theme }) => {
	const isDarkMode = theme.background === "#060606";

	// Brand colors from your Figma spec
	const activeColor = isDarkMode ? "#E7E7E7" : "#2E2E2E";
	const inactiveColor = isDarkMode ? "#A1A1A1" : "#363636";
	const inactiveOpacity = isDarkMode ? 0.75 : 0.5;

	// Variant 04: Disconnected (Special Path)
	if (level === 4) {
		return (
			<Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
				<Path
					d="M1 1L17 17"
					stroke={activeColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M11.5139 6.48633C12.1808 7.15297 12.5555 8.05719 12.5557 9.00011"
					stroke={activeColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M14.0286 3.97168C15.0507 4.99326 15.7373 6.302 15.9969 7.72357C16.2566 9.14515 16.0769 10.6121 15.482 11.929"
					stroke={activeColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M6.48285 11.5139C5.81629 10.8471 5.44183 9.94291 5.44183 9.00011"
					stroke={activeColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M3.96617 14.0286C3.3058 13.3682 2.78197 12.5843 2.42458 11.7215C2.06719 10.8587 1.88324 9.934 1.88324 9.00012"
					stroke={activeColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		);
	}

	// Helper to determine color/opacity per path based on level
	const getStyle = (pathLevel: number) => {
		if (level === 1) return { color: activeColor, opacity: 1 };
		if (level === 2) {
			return pathLevel === 1
				? { color: inactiveColor, opacity: inactiveOpacity }
				: { color: activeColor, opacity: 1 };
		}
		// Level 3 (Low)
		return pathLevel === 0
			? { color: activeColor, opacity: 1 }
			: { color: inactiveColor, opacity: inactiveOpacity };
	};

	return (
		<Svg width="18" height="14" viewBox="0 0 18 14" fill="none">
			{/* Center Dot (Level 0) */}
			<Path
				d="M9.00635 6.65723V6.66723"
				stroke={activeColor}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Inner Rings (Level 1) */}
			<Path
				d="M11.8345 3.8291C12.5844 4.57921 13.0056 5.59644 13.0056 6.6571C13.0056 7.71776 12.5844 8.73499 11.8345 9.4851"
				stroke={getStyle(2).color}
				strokeOpacity={getStyle(2).opacity}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M6.17456 9.4851C5.42468 8.73499 5.00342 7.71776 5.00342 6.6571C5.00342 5.59644 5.42468 4.57921 6.17456 3.8291"
				stroke={getStyle(2).color}
				strokeOpacity={getStyle(2).opacity}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Outer Rings (Level 2) */}
			<Path
				d="M14.6636 1C15.4065 1.74287 15.9958 2.62481 16.3979 3.59544C16.7999 4.56607 17.0069 5.60639 17.0069 6.657C17.0069 7.70761 16.7999 8.74793 16.3979 9.71856C15.9958 10.6892 15.4065 11.5711 14.6636 12.314"
				stroke={getStyle(1).color}
				strokeOpacity={getStyle(1).opacity}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M3.34329 12.314C2.60038 11.5711 2.01107 10.6892 1.609 9.71856C1.20694 8.74793 1 7.70761 1 6.657C1 5.60639 1.20694 4.56607 1.609 3.59544C2.01107 2.62481 2.60038 1.74287 3.34329 1"
				stroke={getStyle(1).color}
				strokeOpacity={getStyle(1).opacity}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default WifiIcon;
