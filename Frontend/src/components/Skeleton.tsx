/** Skeleton — pulsing placeholder + prebuilt History/stat skeletons. */
import React, { useEffect } from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/theme/ThemeProvider';

interface BoxProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: BoxProps) {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.cardAlt },
        animated,
        style,
      ]}
    />
  );
}

export function HistoryCardSkeleton() {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
      }}
    >
      <Skeleton width={84} height={84} radius={radius.md} />
      <View style={{ flex: 1, gap: spacing.sm, justifyContent: 'center' }}>
        <Skeleton width="55%" height={18} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="70%" height={12} />
      </View>
    </View>
  );
}

export function GridSkeleton({ count = 15 }: { count?: number }) {
  const { spacing } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width="18%" height={48} radius={12} />
      ))}
    </View>
  );
}
