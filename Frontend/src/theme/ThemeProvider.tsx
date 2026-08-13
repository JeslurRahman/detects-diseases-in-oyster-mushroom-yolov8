/**
 * ThemeProvider — resolves the active palette (respecting the persisted mode +
 * OS scheme) and exposes it via `useAppTheme`. Also builds the matching
 * React Native Paper and React Navigation themes.
 */
import {
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
  Theme as NavTheme,
} from '@react-navigation/native';
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  PaperProvider,
} from 'react-native-paper';

import { useThemeStore } from '@/store/themeStore';

import { darkPalette, lightPalette, Palette } from './colors';
import { fonts, type } from './typography';
import { radius, spacing } from './spacing';

interface AppTheme {
  colors: Palette;
  scheme: 'light' | 'dark';
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof type;
  fonts: typeof fonts;
}

const ThemeContext = createContext<AppTheme | null>(null);

export function useAppTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}

function buildPaperTheme(p: Palette, scheme: 'light' | 'dark'): MD3Theme {
  const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: p.primary,
      onPrimary: p.onPrimary,
      secondary: p.primarySoft,
      background: p.background,
      surface: p.surface,
      surfaceVariant: p.card,
      onSurface: p.text,
      onSurfaceVariant: p.textMuted,
      outline: p.border,
      error: p.blackMold,
      elevation: {
        ...base.colors.elevation,
        level0: 'transparent',
        level1: p.surface,
        level2: p.card,
        level3: p.cardAlt,
      },
    },
  };
}

function buildNavTheme(p: Palette, scheme: 'light' | 'dark'): NavTheme {
  const base = scheme === 'dark' ? NavDark : NavLight;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: p.primary,
      background: p.background,
      card: p.surface,
      text: p.text,
      border: p.border,
      notification: p.greenMold,
    },
  };
}

export function ThemeProvider({
  children,
}: {
  children: (nav: NavTheme) => React.ReactNode;
}) {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  const scheme: 'light' | 'dark' =
    mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<AppTheme>(() => {
    const colors = scheme === 'dark' ? darkPalette : lightPalette;
    return { colors, scheme, spacing, radius, type, fonts };
  }, [scheme]);

  const paperTheme = useMemo(
    () => buildPaperTheme(value.colors, scheme),
    [value.colors, scheme],
  );
  const navTheme = useMemo(
    () => buildNavTheme(value.colors, scheme),
    [value.colors, scheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>{children(navTheme)}</PaperProvider>
    </ThemeContext.Provider>
  );
}
