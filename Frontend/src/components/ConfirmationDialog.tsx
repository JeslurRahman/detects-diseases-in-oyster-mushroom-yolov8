/** ConfirmationDialog — Paper dialog for destructive confirmations. */
import React from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const { colors, radius } = useAppTheme();
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onCancel}
        style={{ backgroundColor: colors.surface, borderRadius: radius.xl }}
      >
        <Dialog.Title>
          <AppText variant="h2">{title}</AppText>
        </Dialog.Title>
        <Dialog.Content>
          <AppText variant="body" color="textMuted">
            {message}
          </AppText>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel} textColor={colors.textMuted}>
            {cancelLabel}
          </Button>
          <Button
            onPress={onConfirm}
            loading={loading}
            textColor={destructive ? colors.blackMold : colors.primary}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
