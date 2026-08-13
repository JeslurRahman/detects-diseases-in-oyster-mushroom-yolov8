/** SecondaryButton — soft/tonal button (used for "Upload from Gallery" etc.). */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

interface Props {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function SecondaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: Props) {
  const { colors, radius, spacing } = useAppTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={animated}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 140 }))}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
        style={{
          backgroundColor: colors.cardAlt,
          borderRadius: radius.lg,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: isDisabled ? 0.6 : 1,
          ...style,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={20} color={colors.primary} /> : null}
            <AppText variant="h3" color="primary">
              {label}
            </AppText>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
