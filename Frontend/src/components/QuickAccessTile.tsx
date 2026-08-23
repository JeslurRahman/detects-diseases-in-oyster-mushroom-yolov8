/** QuickAccessTile — a feature tile on the Home dashboard. */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/theme/ThemeProvider';
import { elevation } from '@/theme/spacing';

import { AppText } from './AppText';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  available?: boolean;
}

export function QuickAccessTile({ icon, label, onPress, available = true }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: '48%' }, anim]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 140 }))}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.md,
          alignItems: 'center',
          gap: spacing.md,
          minHeight: 150,
          justifyContent: 'center',
          ...elevation(colors, 1),
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            backgroundColor: available ? colors.healthySoft : colors.cardAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={32}
            color={available ? colors.primary : colors.textFaint}
          />
        </View>
        <AppText
          variant="h3"
          center
          numberOfLines={2}
          style={{ color: available ? colors.primary : colors.textMuted }}
        >
          {label}
        </AppText>
        {!available ? (
          <AppText variant="micro" color="textFaint">
            COMING SOON
          </AppText>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
