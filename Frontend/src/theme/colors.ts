/**
 * colors.ts — single source of truth for the app palette.
 *
 * Brand values come from the design spec; neutrals are tinted toward the brand
 * green (never pure black/white) for subconscious cohesion. Dark mode uses a
 * warm green-black rather than a neutral slate — organic, not "techy".
 */

export type DiseaseKey = 'healthy' | 'green_mold' | 'black_mold';

export interface Palette {
  primary: string;
  primarySoft: string;
  onPrimary: string;

  background: string;
  surface: string;
  card: string;
  cardAlt: string;

  healthy: string;
  greenMold: string;
  blackMold: string;
  warning: string;

  // soft badge / chip backgrounds
  healthySoft: string;
  greenMoldSoft: string;
  blackMoldSoft: string;
  warningSoft: string;

  text: string;
  textMuted: string;
  textFaint: string;

  border: string;
  borderStrong: string;

  shadow: string;
  overlay: string;
}

export const lightPalette: Palette = {
  primary: '#3E5D46',
  primarySoft: '#6B8A72',
  onPrimary: '#FDFEFB',

  background: '#F7F8F5',
  surface: '#FDFDFA',
  card: '#F1EFE6',
  cardAlt: '#EAE8DC',

  healthy: '#5AA469',
  greenMold: '#F5A623',
  blackMold: '#9B2D2D',
  warning: '#F6C65B',

  healthySoft: '#E3EFE2',
  greenMoldSoft: '#FBEBD1',
  blackMoldSoft: '#F1DDDB',
  warningSoft: '#FCF1D6',

  text: '#2E2E2E',
  textMuted: '#77806F',
  textFaint: '#A2A99B',

  border: '#E4E5DD',
  borderStrong: '#D3D5C8',

  shadow: '#3E5D46',
  overlay: 'rgba(24, 33, 26, 0.45)',
};

export const darkPalette: Palette = {
  primary: '#84AC8E',
  primarySoft: '#5E7E68',
  onPrimary: '#12201A',

  background: '#151D18',
  surface: '#1D2721',
  card: '#232E27',
  cardAlt: '#2B372F',

  healthy: '#71C081',
  greenMold: '#EEB24E',
  blackMold: '#D3736B',
  warning: '#F0C766',

  healthySoft: '#23342A',
  greenMoldSoft: '#3A3122',
  blackMoldSoft: '#3A2725',
  warningSoft: '#3A3324',

  text: '#ECEFE8',
  textMuted: '#9EA898',
  textFaint: '#6C7568',

  border: '#32403A',
  borderStrong: '#3E4D45',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/** Base literal used for splash / pre-theme surfaces. */
export const BRAND_PRIMARY = '#3E5D46';

export function diseaseColor(p: Palette, key: DiseaseKey): string {
  switch (key) {
    case 'healthy':
      return p.healthy;
    case 'green_mold':
      return p.greenMold;
    case 'black_mold':
      return p.blackMold;
  }
}

export function diseaseSoftColor(p: Palette, key: DiseaseKey): string {
  switch (key) {
    case 'healthy':
      return p.healthySoft;
    case 'green_mold':
      return p.greenMoldSoft;
    case 'black_mold':
      return p.blackMoldSoft;
  }
}
