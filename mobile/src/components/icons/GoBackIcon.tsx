import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
}

const GoBackIcon: React.FC<Props> = ({
  width = 10,
  height = 16,
  fill = "#2E2E2E",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 9 15" fill="none">
      <Path
        d="M2.63685 7.42476L8.04418 12.9559C8.24317 13.1667 8.35328 13.4489 8.35079 13.7419C8.3483 14.0349 8.23341 14.3152 8.03088 14.5223C7.82834 14.7295 7.55435 14.847 7.26793 14.8496C6.98151 14.8521 6.70557 14.7395 6.49954 14.5359L0.319885 8.21476C0.115093 8.00522 4.75619e-05 7.72105 4.75872e-05 7.42475C4.76125e-05 7.12846 0.115093 6.84429 0.319885 6.63475L6.49954 0.313572C6.70557 0.110027 6.98151 -0.00260158 7.26793 -5.56349e-05C7.55435 0.00249031 7.82834 0.120008 8.03088 0.327184C8.23342 0.534361 8.3483 0.81462 8.35079 1.1076C8.35328 1.40058 8.24317 1.68284 8.04418 1.89359L2.63685 7.42476Z"
        fill={fill}
      />
    </Svg>
  );
};

export default GoBackIcon;
