import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
  outline?: boolean;
  darkMode?: boolean;
}

const BookmarkIcon: React.FC<Props> = ({
  width = 13,
  height = 18,
  fill,
  outline = false,
  darkMode = false,
}) => {
  const getStrokeColor = () => {
    if (fill) return fill;
    return darkMode ? "#e7e7e7" : "#2e2e2e";
  };

  const getFillColor = () => {
    if (fill) return fill;
    return darkMode ? "#e7e7e7" : "#2e2e2e";
  };

  // Outline mode
  if (outline) {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 13 18"
        fill="none"
        accessibilityLabel="Bookmark icon"
        accessible={true}
      >
        <Path
          d="m9.937 1 .146.008a1.486 1.486 0 0 1 1.339 1.477v13.442l-4.546-4.042-.665-.591-.664.59L1 15.928V2.485a1.487 1.487 0 0 1 1.339-1.477L2.485 1z"
          stroke={getStrokeColor()}
          strokeWidth={2}
        />
      </Svg>
    );
  }

  // Fill mode (default)
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 13 18"
      fill="none"
      accessibilityLabel="Bookmark icon"
      accessible={true}
    >
      <Path
        d="M11.801 17.391a.62.62 0 0 1-.413-.155l-5.177-4.604-5.177 4.604A.621.621 0 0 1 0 16.77V2.484A2.487 2.487 0 0 1 2.484 0h7.454a2.487 2.487 0 0 1 2.484 2.484V16.77a.62.62 0 0 1-.621.621"
        fill={getFillColor()}
      />
    </Svg>
  );
};

export default React.memo(BookmarkIcon);