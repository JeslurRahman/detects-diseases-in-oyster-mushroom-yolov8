/** disease.ts — display metadata for the three disease classes. */
import type { DiseaseKey } from '@/theme/colors';

export interface DiseaseMeta {
  key: DiseaseKey;
  label: string;
  scientific?: string;
  recommendation: string;
  short: string;
}

export const DISEASES: Record<DiseaseKey, DiseaseMeta> = {
  healthy: {
    key: 'healthy',
    label: 'Healthy',
    recommendation: 'No disease detected. Continue routine monitoring.',
    short: 'No disease detected.',
  },
  green_mold: {
    key: 'green_mold',
    label: 'Green Mold',
    scientific: 'Trichoderma',
    recommendation:
      'Green mold (Trichoderma) detected. Immediate isolation is recommended to prevent spread to neighbouring bags.',
    short: 'Immediate isolation recommended.',
  },
  black_mold: {
    key: 'black_mold',
    label: 'Black Mold',
    scientific: 'Aspergillus',
    recommendation:
      'Black mold (Aspergillus) detected. Remove and dispose of the bag safely, then sanitize the surrounding area.',
    short: 'Remove & dispose safely.',
  },
};

export const DISEASE_ORDER: DiseaseKey[] = ['healthy', 'green_mold', 'black_mold'];

export function diseaseMeta(key: string): DiseaseMeta {
  return DISEASES[(key as DiseaseKey) in DISEASES ? (key as DiseaseKey) : 'healthy'];
}

export function isInfected(key: string): boolean {
  return key === 'green_mold' || key === 'black_mold';
}

/** Filter chips used on the History screen. */
export const HISTORY_FILTERS: { label: string; value: DiseaseKey | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Green Mold', value: 'green_mold' },
  { label: 'Black Mold', value: 'black_mold' },
];
