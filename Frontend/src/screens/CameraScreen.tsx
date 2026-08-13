/**
 * CameraScreen — full-screen capture with take → preview → retake/use flow.
 * On "Use Photo" the image is stored in predictionStore and we return to Capture.
 */
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, PrimaryButton, SecondaryButton } from '@/components';
import type { RootStackParamList } from '@/navigation/types';
import { usePredictionStore } from '@/store/predictionStore';
import { useAppTheme } from '@/theme/ThemeProvider';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, spacing } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const setImage = usePredictionStore((s) => s.setImage);

  const takePicture = async () => {
    if (!cameraRef.current || busy) return;
    try {
      setBusy(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) setPhotoUri(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const usePhoto = () => {
    if (!photoUri) return;
    setImage({ uri: photoUri, name: 'capture.jpg', mimeType: 'image/jpeg' });
    navigation.goBack();
  };

  // --- permission gate -------------------------------------------------
  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }
  if (!permission.granted) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: spacing.xl,
          justifyContent: 'center',
          gap: spacing.lg,
        }}
      >
        <Ionicons name="camera-outline" size={48} color={colors.primary} />
        <AppText variant="title">Camera access needed</AppText>
        <AppText variant="body" color="textMuted">
          Grant camera permission to photograph mushroom bags for detection.
        </AppText>
        <PrimaryButton label="Grant permission" onPress={requestPermission} />
        <SecondaryButton label="Go back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // --- preview ---------------------------------------------------------
  if (photoUri) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <Image
          source={{ uri: photoUri }}
          style={{ flex: 1 }}
          contentFit="contain"
        />
        <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.xl }}>
          <View style={{ flex: 1 }}>
            <SecondaryButton
              label="Retake"
              icon="refresh"
              onPress={() => setPhotoUri(null)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Use Photo" icon="checkmark" onPress={usePhoto} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- live camera -----------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <SafeAreaView
        edges={['top']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={{ margin: spacing.lg, alignSelf: 'flex-start' }}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </Pressable>
      </SafeAreaView>
      <SafeAreaView
        edges={['bottom']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
      >
        <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
          <Pressable
            onPress={takePicture}
            accessibilityRole="button"
            accessibilityLabel="Take picture"
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: '#fff',
              }}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
