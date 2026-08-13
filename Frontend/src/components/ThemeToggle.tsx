/** ThemeToggle — cycles light → dark → system. */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

import { useThemeStore } from '@/store/themeStore';
import { useAppTheme } from '@/theme/ThemeProvider';

const NEXT = { light: 'dark', dark: 'system', system: 'light' } as const;
const ICON = {
  light: 'sunny-outline',
  dark: 'moon-outline',
  system: 'contrast-outline',
} as const;

export function ThemeToggle() {
  const { colors } = useAppTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <Pressable
      onPress={() => setMode(NEXT[mode])}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${mode}. Tap to change.`}
      style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={ICON[mode]} size={22} color={colors.text} />
    </Pressable>
  );
}
