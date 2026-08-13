/** ImageUploader — the image preview box on the Capture screen. */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props {
  uri?: string | null;
  onPress?: () => void;
  height?: number;
}

export function ImageUploader({ uri, onPress, height = 200 }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="imagebutton"
      accessibilityLabel={uri ? 'Selected image, tap to change' : 'Add an image'}
      style={{
        height,
        borderRadius: radius.xl,
        overflow: 'hidden',
        backgroundColor: colors.cardAlt,
        borderWidth: uri ? 0 : 1.5,
        borderColor: colors.borderStrong,
        borderStyle: uri ? 'solid' : 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={220}
        />
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: colors.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="camera" size={30} color={colors.onPrimary} />
          </View>
          <AppText variant="caption" color="textMuted">
            Tap to capture or upload
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
