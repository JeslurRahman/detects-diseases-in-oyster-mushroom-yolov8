/**
 * RootNavigator — Home is a standalone screen (no tab bar). The Capture /
 * Tracking / History tabs live behind the "Disease Detection" flow, so the tab
 * bar only appears once the user enters disease detection.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CameraScreen } from '@/screens/CameraScreen';
import { DetailScreen } from '@/screens/DetailScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { WebViewScreen } from '@/screens/WebViewScreen';

import { BottomTabs } from './BottomTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="DiseaseDetection"
        component={BottomTabs}
        options={{ animation: 'slide_from_right' }}
      />
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
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
