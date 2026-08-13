/** Header — centered screen title with optional back button + right slot. */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function Header({ title, subtitle, onBack, right }: Props) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        paddingTop: spacing.xs,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 40,
        }}
      >
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
        <AppText variant="title" style={{ flex: 1 }} center numberOfLines={1}>
          {title}
        </AppText>
        <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
      </View>
      {subtitle ? (
        <AppText variant="body" color="textMuted" center style={{ marginTop: spacing.xs }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
