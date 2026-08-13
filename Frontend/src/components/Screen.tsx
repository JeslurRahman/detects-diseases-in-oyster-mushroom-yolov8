/** Screen — safe-area page wrapper with the themed background. */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';

interface Props {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

export function Screen({ children, edges = ['top'], style }: Props) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
