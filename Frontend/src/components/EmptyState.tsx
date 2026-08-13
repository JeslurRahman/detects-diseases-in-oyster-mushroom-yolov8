/** EmptyState — teaches the user what to do, not just "nothing here". */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'leaf-outline', title, message, action }: Props) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['4xl'],
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 26,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={34} color={colors.primarySoft} />
      </View>
      <AppText variant="h2" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color="textMuted" center>
          {message}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}
