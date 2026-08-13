/** Legend — status color key used on the Tracking screen. */
import React from 'react';
import { View } from 'react-native';

import { DISEASE_ORDER, diseaseMeta } from '@/constants/disease';
import { useAppTheme } from '@/theme/ThemeProvider';
import { diseaseColor } from '@/theme/colors';

import { AppText } from './AppText';

export function Legend() {
  const { colors, spacing } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {DISEASE_ORDER.map((key) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 5,
              backgroundColor: diseaseColor(colors, key),
            }}
          />
          <AppText variant="caption" color="textMuted">
            {diseaseMeta(key).label}
          </AppText>
        </View>
      ))}
    </View>
  );
}
