/** AppInput — labelled text field with error state. Controlled (RHF-friendly). */
import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props extends TextInputProps {
  label?: string;
  optional?: boolean;
  error?: string;
  multiline?: boolean;
}

export const AppInput = forwardRef<TextInput, Props>(function AppInput(
  { label, optional, error, multiline, style, ...rest },
  ref,
) {
  const { colors, radius, spacing, type } = useAppTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      {label ? (
        <AppText variant="label">
          {label}
          {optional ? (
            <AppText variant="label" color="textMuted">
              {'  '}(Optional)
            </AppText>
          ) : null}
        </AppText>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: error ? colors.blackMold : colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: multiline ? spacing.md : spacing.md,
            minHeight: multiline ? 84 : 50,
            textAlignVertical: multiline ? 'top' : 'center',
            color: colors.text,
            ...type.body,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="blackMold">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});
