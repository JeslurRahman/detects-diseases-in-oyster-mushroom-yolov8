/** BottomTabs — Capture / Tracking / History. */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native';

import { CaptureScreen } from '@/screens/CaptureScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { TrackingScreen } from '@/screens/TrackingScreen';
import { useAppTheme } from '@/theme/ThemeProvider';

import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<
  keyof TabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Capture: { active: 'camera', inactive: 'camera-outline' },
  Tracking: { active: 'location', inactive: 'location-outline' },
  History: { active: 'time', inactive: 'time-outline' },
};

export function BottomTabs() {
  const { colors, spacing, fonts } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === 'ios' ? spacing['2xl'] : spacing.sm,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemibold, fontSize: 12 },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            name={focused ? ICONS[route.name].active : ICONS[route.name].inactive}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Capture" component={CaptureScreen} />
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
