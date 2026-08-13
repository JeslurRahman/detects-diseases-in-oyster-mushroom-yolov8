/** AppText — themed Text with a typographic variant + optional color token. */
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/colors';

type Variant = keyof ReturnType<typeof useAppTheme>['type'];

interface Props extends TextProps {
  variant?: Variant;
  color?: keyof Palette | string;
  center?: boolean;
}

export function AppText({
  variant = 'body',
  color = 'text',
  center,
  style,
  ...rest
}: Props) {
  const { type, colors } = useAppTheme();
  const resolved =
    (color in colors ? colors[color as keyof Palette] : (color as string)) ?? colors.text;

  const base: TextStyle = {
    ...type[variant],
    color: resolved,
    ...(center ? { textAlign: 'center' } : null),
  };

  return <Text style={[base, style]} {...rest} />;
}
