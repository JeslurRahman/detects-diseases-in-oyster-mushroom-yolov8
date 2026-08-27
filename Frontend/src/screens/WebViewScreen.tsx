/**
 * WebViewScreen — loads an external hosted web app inside the mobile app
 * (used for features hosted separately, e.g. Growth Stage Detection).
 */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 12000);
    return () => clearTimeout(t);
  }, [loading]);

  const reload = () => {
    setFailed(false);
    webRef.current?.reload();
  };

  const showOverlay = loading && !firstLoadDone && !failed;

  return (
    <Screen>
      <Header
        title={params.title}
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={reload}
            hitSlop={12}
            accessibilityLabel="Reload page"
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="reload" size={20} color={colors.text} />
          </Pressable>
        }
      />
      <View style={{ flex: 1 }}>
        {failed ? (
          <ErrorView
            error={{
              kind: 'network',
              message: "Couldn't load the page. Check your connection and try again.",
            }}
            onRetry={reload}
          />
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: params.url }}
            onLoadStart={() => {
              if (!firstLoadDone) setLoading(true);
            }}
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress >= 1) setLoading(false);
            }}
            onLoadEnd={() => {
              setLoading(false);
              setFirstLoadDone(true);
            }}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
            onContentProcessDidTerminate={() => webRef.current?.reload()}
            originWhitelist={['*']}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            domStorageEnabled
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            pullToRefreshEnabled
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

        {showOverlay ? (
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
