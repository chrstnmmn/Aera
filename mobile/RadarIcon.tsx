
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  width?: number | string;
  height?: number | string;
  color?: string; // Using 'color' instead of 'fill' because it uses strokes
}

const RadarIcon: React.FC<Props> = ({ 
  width = 18, 
  height = 14, 
  color = "#2E2E2E" 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 14" fill="none">
      <Path d="M9.00635 6.65723V6.66723" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11.8345 3.8291C12.5844 4.57921 13.0056 5.59644 13.0056 6.6571C13.0056 7.71776 12.5844 8.73499 11.8345 9.4851" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14.6636 1C15.4065 1.74287 15.9958 2.62481 16.3979 3.59544C16.7999 4.56607 17.0069 5.60639 17.0069 6.657C17.0069 7.70761 16.7999 8.74793 16.3979 9.71856C15.9958 10.6892 15.4065 11.5711 14.6636 12.314" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6.17456 9.4851C5.42468 8.73499 5.00342 7.71776 5.00342 6.6571C5.00342 5.59644 5.42468 4.57921 6.17456 3.8291" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3.34329 12.314C2.60038 11.5711 2.01107 10.6892 1.609 9.71856C1.20694 8.74793 1 7.70761 1 6.657C1 5.60639 1.20694 4.56607 1.609 3.59544C2.01107 2.62481 2.60038 1.74287 3.34329 1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
};

export default RadarIcon;