/** Navigation param lists. */
import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Capture: undefined;
  Tracking: undefined;
  History: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Camera: undefined;
  Detail: { id: number };
};
