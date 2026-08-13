/** HistoryCard — a detection row in the History list. */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';

import { absoluteImageUrl } from '@/constants/config';
import { useAppTheme } from '@/theme/ThemeProvider';
import { elevation } from '@/theme/spacing';
import type { Detection } from '@/types';
import { formatDateTime } from '@/utils/format';

import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

interface Props {
  item: Detection;
  onPress: () => void;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="caption" color={muted ? 'textMuted' : 'text'}>
        {value}
      </AppText>
    </View>
  );
}

export function HistoryCard({ item, onPress }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  const uri = absoluteImageUrl(item.image_url);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md,
        ...elevation(colors, 1),
      }}
    >
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.cardAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons name="leaf-outline" size={26} color={colors.textFaint} />
        )}
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <AppText variant="h3" numberOfLines={1}>
              {item.disease_display}
            </AppText>
            {item.scientific_name ? (
              <AppText variant="caption" color="textMuted">
                ({item.scientific_name})
              </AppText>
            ) : null}
          </View>
          <StatusBadge status={item.prediction} size="sm" />
        </View>
        <Row label="Rack ID:" value={item.rack_name} />
        <Row label="Bag ID:" value={item.bag_id} />
        <Row label="Detected:" value={formatDateTime(item.captured_at)} muted />
      </View>
    </Pressable>
  );
}
