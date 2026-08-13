/** BagCard — a single bag cell in the rack grid, colored by status. */
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAppTheme } from '@/theme/ThemeProvider';
import { diseaseColor, diseaseSoftColor, type DiseaseKey } from '@/theme/colors';

import { AppText } from './AppText';

interface Props {
  bagId: string;
  status: DiseaseKey;
  index?: number;
  onPress?: () => void;
}

export function BagCard({ bagId, status, index = 0, onPress }: Props) {
  const { colors, radius } = useAppTheme();
  // Black mold = strong fill (white text); others = soft fill (colored text).
  const strong = status === 'black_mold';
  const bg = strong ? diseaseColor(colors, status) : diseaseSoftColor(colors, status);
  const fg = strong ? '#FDFEFB' : diseaseColor(colors, status);

  return (
    <Animated.View entering={FadeIn.delay(Math.min(index * 18, 300)).duration(220)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Bag ${bagId}, ${status.replace('_', ' ')}`}
        style={{
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText variant="bodyStrong" style={{ color: fg }}>
          {bagId}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}
