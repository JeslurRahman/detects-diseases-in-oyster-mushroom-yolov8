/**
 * PredictionCard — the detection result card shown on Capture after /predict.
 * Colored + iconed by the detected class, with the recommendation copy.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { diseaseMeta } from '@/constants/disease';
import { useAppTheme } from '@/theme/ThemeProvider';
import { diseaseColor, diseaseSoftColor, type DiseaseKey } from '@/theme/colors';
import { formatConfidence } from '@/utils/format';

import { AppText } from './AppText';
import { BotanicalAccent } from './BotanicalAccent';

interface Props {
  prediction: DiseaseKey;
  confidence: number;
}

const ICON: Record<DiseaseKey, keyof typeof Ionicons.glyphMap> = {
  healthy: 'checkmark-circle',
  green_mold: 'alert-circle',
  black_mold: 'warning',
};

export function PredictionCard({ prediction, confidence }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  const meta = diseaseMeta(prediction);
  const fg = diseaseColor(colors, prediction);
  const bg = diseaseSoftColor(colors, prediction);

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      style={{
        backgroundColor: bg,
        borderRadius: radius.xl,
        padding: spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: fg + '33',
      }}
    >
      <BotanicalAccent
        size={130}
        color={fg}
        opacity={0.1}
        style={{ position: 'absolute', right: -20, bottom: -30 }}
      />
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <Ionicons name={ICON[prediction]} size={26} color={fg} />
        <View style={{ flex: 1, gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <AppText variant="h3" style={{ color: fg }}>
              {meta.label}
              {meta.scientific ? (
                <AppText variant="caption" color="textMuted">
                  {'  '}
                  {meta.scientific}
                </AppText>
              ) : null}
            </AppText>
            <AppText variant="label" style={{ color: fg }}>
              {formatConfidence(confidence)}
            </AppText>
          </View>
          <AppText variant="body" color="text">
            {meta.recommendation}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}
