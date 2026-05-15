import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
	width?: number | string;
	height?: number | string;
	fill?: string;
}

const FanSpeedMonitorIcon: React.FC<Props> = ({
	width = 18,
	height = 15,
	fill = "#2E2E2E",
}) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 18 15" fill="none">
			<Path
				d="M14.772 2.52A8.664 8.664 0 0 0 2.159 14.386l.007.007q.017.02.036.038.04.046.093.1a1.486 1.486 0 0 0 2.179-.015 5.673 5.673 0 0 1 8.348 0 1.487 1.487 0 0 0 2.19.002l.115-.126.007-.007a8.66 8.66 0 0 0-.361-11.868zm-6.704.351a.578.578 0 1 1 1.155 0v1.155a.578.578 0 1 1-1.155 0zM4.025 9.225H2.87a.578.578 0 0 1 0-1.155h1.155a.578.578 0 0 1 0 1.155m1.762-3.437a.58.58 0 0 1-.817 0l-.817-.817a.578.578 0 0 1 .817-.816l.817.816a.58.58 0 0 1 0 .817m5.39.834L9.461 9.347a1.1 1.1 0 0 1-.253.253 1.087 1.087 0 0 1-1.264-1.769l2.726-1.714a.37.37 0 0 1 .422 0 .363.363 0 0 1 .083.505m1.144-.834a.578.578 0 0 1-.816-.817l.816-.816a.578.578 0 0 1 .817.816zm2.1 3.437h-1.155a.577.577 0 1 1 0-1.155h1.156a.577.577 0 1 1 0 1.155"
				fill={fill}
			/>
		</Svg>
	);
};

export default FanSpeedMonitorIcon;
