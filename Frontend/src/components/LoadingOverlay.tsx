/** LoadingOverlay — full-screen blocking loader with a message. */
import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { elevation } from '@/theme/spacing';

import { AppText } from './AppText';

interface Props {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            paddingVertical: spacing['2xl'],
            paddingHorizontal: spacing['3xl'],
            alignItems: 'center',
            gap: spacing.md,
            ...elevation(colors, 3),
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? (
            <AppText variant="bodyStrong" center>
              {message}
            </AppText>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
