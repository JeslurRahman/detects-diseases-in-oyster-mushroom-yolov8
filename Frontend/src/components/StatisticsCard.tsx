/** StatisticsCard — a labelled metric used in the Tracking stat row. */
import React from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { elevation } from '@/theme/spacing';

import { AppText } from './AppText';

interface Props {
  label: string;
  value: number | string;
  accent?: string;
  emphasis?: boolean;
}

export function StatisticsCard({ label, value, accent, emphasis }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: emphasis && accent ? accent : colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        gap: 2,
        ...elevation(colors, 1),
      }}
    >
      <AppText variant="caption" color="textMuted" center numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="hero" style={{ color: accent ?? colors.text }}>
        {value}
      </AppText>
    </View>
  );
}
