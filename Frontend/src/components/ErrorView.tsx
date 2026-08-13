/** ErrorView — friendly error with a retry affordance. */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import type { AppError } from '@/utils/errors';

import { AppText } from './AppText';
import { SecondaryButton } from './SecondaryButton';

interface Props {
  error?: AppError | null;
  onRetry?: () => void;
}

export function ErrorView({ error, onRetry }: Props) {
  const { colors, spacing } = useAppTheme();
  const offline = error?.kind === 'network' || error?.kind === 'timeout';
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
      <Ionicons
        name={offline ? 'cloud-offline-outline' : 'alert-circle-outline'}
        size={44}
        color={colors.blackMold}
      />
      <AppText variant="h3" center>
        {offline ? 'Connection problem' : 'Something went wrong'}
      </AppText>
      <AppText variant="body" color="textMuted" center>
        {error?.message ?? 'Please try again.'}
      </AppText>
      {onRetry ? <SecondaryButton label="Retry" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}
