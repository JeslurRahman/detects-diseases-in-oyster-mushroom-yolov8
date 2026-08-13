/** StatusBadge — pill showing a disease status in its brand color. */
import React from 'react';
import { Text, View } from 'react-native';

import { diseaseMeta } from '@/constants/disease';
import { useAppTheme } from '@/theme/ThemeProvider';
import { diseaseColor, diseaseSoftColor, type DiseaseKey } from '@/theme/colors';

interface Props {
  status: DiseaseKey;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const { colors, radius, type } = useAppTheme();
  const fg = diseaseColor(colors, status);
  const bg = diseaseSoftColor(colors, status);
  const label = diseaseMeta(status).label;
  const padV = size === 'sm' ? 4 : 6;
  const padH = size === 'sm' ? 10 : 12;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingHorizontal: padH,
        paddingVertical: padV,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ ...type.micro, color: fg, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
