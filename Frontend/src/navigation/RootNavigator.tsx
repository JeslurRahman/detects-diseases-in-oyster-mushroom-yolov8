/** RootNavigator — stack wrapping the tabs + Camera (modal) + Detail. */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CameraScreen } from '@/screens/CameraScreen';
import { DetailScreen } from '@/screens/DetailScreen';

import { BottomTabs } from './BottomTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
