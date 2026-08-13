/**
 * typography.ts — font families + a modular type scale.
 * Quicksand (rounded geometric) for display, Nunito (warm humanist) for body —
 * deliberately not Inter/Roboto/system.
 */

export const fonts = {
  display: 'Quicksand_700Bold',
  displaySemibold: 'Quicksand_600SemiBold',
  displayMedium: 'Quicksand_500Medium',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_600SemiBold',
  bodySemibold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  h2: { fontFamily: fonts.displaySemibold, fontSize: 18, lineHeight: 24 },
  h3: { fontFamily: fonts.displaySemibold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14, lineHeight: 20 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.bodySemibold, fontSize: 11, lineHeight: 14 },
} as const;
