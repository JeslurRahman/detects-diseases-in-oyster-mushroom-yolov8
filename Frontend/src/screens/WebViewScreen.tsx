/**
 * WebViewScreen — loads an external hosted web app inside the mobile app
 * (used for features hosted separately, e.g. Growth Stage Detection).
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ErrorView, Header, Screen } from '@/components';
import type { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/theme/ThemeProvider';

type Rt = RouteProp<RootStackParamList, 'WebView'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'WebView'>;

export function WebViewScreen() {
  const { params } = useRoute<Rt>();
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <Screen>
      <Header title={params.title} onBack={() => navigation.goBack()} />
      <View style={{ flex: 1 }}>
        {failed ? (
          <ErrorView
            error={{
              kind: 'network',
              message: "Couldn't load the page. Check your connection and try again.",
            }}
            onRetry={() => {
              setFailed(false);
              setLoading(true);
              webRef.current?.reload();
            }}
          />
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: params.url }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
            originWhitelist={['*']}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            domStorageEnabled
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            // --- file upload ("Browse Files") ---
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            setSupportMultipleWindows={false}
            // --- in-page camera ("Take Photo") ---
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
            allowsProtectedMedia
            style={{ flex: 1, backgroundColor: colors.background }}
          />
        )}

        {loading && !failed ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
