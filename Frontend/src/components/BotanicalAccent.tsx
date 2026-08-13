/**
 * BotanicalAccent — a faint leaf-sprig motif echoing the watermark in the
 * mockups. Purely decorative; sits low-opacity in a corner to add organic
 * texture without competing with content.
 */
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

export function BotanicalAccent({ size = 120, color, opacity = 0.08, style }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={style}
      pointerEvents="none"
    >
      <Path
        d="M50 96 C50 70 50 40 50 14"
        stroke={color}
        strokeWidth={2}
        opacity={opacity * 1.4}
        fill="none"
      />
      {[62, 50, 38, 26].map((y, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <Path
            key={y}
            d={`M50 ${y} C ${50 + dir * 20} ${y - 4}, ${50 + dir * 26} ${y - 16}, ${
              50 + dir * 8
            } ${y - 20} C ${50 + dir * 6} ${y - 10}, ${50 + dir * 12} ${y - 4}, 50 ${y}`}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </Svg>
  );
}
