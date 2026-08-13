/** Card — rounded surface with soft, brand-tinted elevation. */
import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { elevation } from '@/theme/spacing';

interface Props extends ViewProps {
  tone?: 'surface' | 'card' | 'cardAlt';
  level?: 1 | 2 | 3;
  padded?: boolean;
  radius?: number;
}

export function Card({
  tone = 'surface',
  level = 1,
  padded = true,
  radius,
  style,
  children,
  ...rest
}: Props) {
  const { colors, radius: r, spacing } = useAppTheme();
  const base: ViewStyle = {
    backgroundColor: colors[tone],
    borderRadius: radius ?? r.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...(padded ? { padding: spacing.lg } : null),
    ...elevation(colors, level),
  };
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
