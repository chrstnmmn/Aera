import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
  glassFill?: string; // This should match the screen background
}

const SuccessBoxIcon: React.FC<Props> = ({
  width = 345,
  height = 595,
  fill = "#1497D9",
  glassFill = "#FFFFFF",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 442 595" fill="none">
      {/* Right Side Panel */}
      <Path
        d="M221.79 561.818C221.79 576.442 237.621 585.584 250.287 578.274L432.077 473.359C437.957 469.965 441.58 463.692 441.58 456.903L441.58 -308.093C441.58 -322.683 425.818 -331.829 413.152 -324.589L231.362 -220.683C225.443 -217.3 221.79 -211.005 221.79 -204.188L221.79 561.818Z"
        fill={fill}
      />
      {/* Middle Glass Panel */}
      <Path
        d="M243.616 449.699C243.616 456.627 251.114 460.957 257.114 457.494L420.188 363.381C422.973 361.774 424.689 358.802 424.689 355.586L424.689 -289.961C424.689 -296.872 417.223 -301.204 411.223 -297.775L248.15 -204.567C245.346 -202.964 243.616 -199.983 243.616 -196.753L243.616 449.699Z"
        fill={glassFill}
      />
      {/* Left Front Panel */}
      <Path
        d="M219.79 561.818C219.79 576.442 203.96 585.584 191.293 578.274L9.50285 473.359C3.62265 469.965 0 463.692 0 456.903V-308.093C0 -322.683 15.762 -331.829 28.4285 -324.589L210.218 -220.683C216.137 -217.3 219.79 -211.005 219.79 -204.188V561.818Z"
        fill={fill}
      />
    </Svg>
  );
};

export default SuccessBoxIcon;
