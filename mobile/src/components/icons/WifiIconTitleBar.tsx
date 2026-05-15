import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface WifiIconTitleBarProps {
  color?: string;
  size?: number;
}

const WifiIconTitleBar = ({ color = "#2E2E2E", size = 10 }: WifiIconTitleBarProps) => {
  // Maintaining the 11:10 aspect ratio
  const width = (size * 11) / 10;

  return (
    <Svg 
      width={width} 
      height={size} 
      viewBox="0 0 11 10" 
      fill="none"
    >
      <Path 
        d="M1 1C5.78647 1 9.66667 4.58172 9.66667 9M1 5C3.39323 5 5.33333 6.79086 5.33333 9M1 9H1.02539" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
};

export default WifiIconTitleBar;