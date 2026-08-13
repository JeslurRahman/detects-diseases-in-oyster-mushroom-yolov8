/** spacing.ts — spacing scale, radii, and elevation presets. */
import { Platform, ViewStyle } from 'react-native';

import type { Palette } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 44,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 26,
  pill: 999,
} as const;

/**
 * Soft, brand-tinted elevation. Shadows use the palette shadow color so cards
 * feel grounded on the warm background rather than floating with a grey halo.
 */
export function elevation(p: Palette, level: 1 | 2 | 3 = 1): ViewStyle {
  const configs = {
    1: { radius: 10, opacity: 0.06, offset: 4, elevation: 2 },
    2: { radius: 18, opacity: 0.09, offset: 8, elevation: 5 },
    3: { radius: 28, opacity: 0.13, offset: 14, elevation: 10 },
  } as const;
  const c = configs[level];
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: p.shadow,
      shadowOpacity: c.opacity,
      shadowRadius: c.radius,
      shadowOffset: { width: 0, height: c.offset },
    },
    android: { elevation: c.elevation, shadowColor: p.shadow },
    default: {},
  })!;
}
