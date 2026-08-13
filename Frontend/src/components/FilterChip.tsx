/** FilterChip — selectable pill for the History disease filter. */
import React from 'react';
import { Pressable } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props {
  label: string;
  active: boolean;
  accent?: string;
  onPress: () => void;
}

export function FilterChip({ label, active, accent, onPress }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  const activeBg = accent ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        backgroundColor: active ? activeBg : colors.cardAlt,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: active ? activeBg : colors.border,
      }}
    >
      <AppText
        variant="label"
        style={{ color: active ? colors.onPrimary : colors.textMuted }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
