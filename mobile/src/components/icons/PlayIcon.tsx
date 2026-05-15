import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
}

const PlayIcon: React.FC<Props> = ({
  width = 14,
  height = 16,
  fill = "#2E2E2E",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 16" fill="none">
      <Path
        d="M1.51 15.026a1.44 1.44 0 0 1-.715-.19A1.6 1.6 0 0 1 0 13.433V1.593C0 1.006.305.468.795.19a1.43 1.43 0 0 1 1.46.018l10.12 6.058a1.47 1.47 0 0 1 0 2.49l-10.122 6.06a1.45 1.45 0 0 1-.744.21"
        fill={fill}
      />
    </Svg>
  );
};

export default PlayIcon;