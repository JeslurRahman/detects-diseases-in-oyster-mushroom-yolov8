/** useImagePicker — pick from the photo library with permission + size checks. */
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';

import { MAX_IMAGE_BYTES } from '@/constants/config';
import type { PickedImage } from '@/store/predictionStore';

function tooLarge(size?: number) {
  return typeof size === 'number' && size > MAX_IMAGE_BYTES;
}

export function useImagePicker() {
  const [picking, setPicking] = useState(false);

  const pickFromGallery = useCallback(async (): Promise<PickedImage | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photo access needed',
        'Enable photo library access in Settings to upload an image.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return null;
    }

    try {
      setPicking(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // SDK 54: MediaTypeOptions removed
        quality: 0.85,
        exif: false,
      });
      if (result.canceled || !result.assets.length) return null;
      const asset = result.assets[0]!;
      if (tooLarge(asset.fileSize)) {
        Alert.alert('Image too large', 'Please choose an image under 12 MB.');
        return null;
      }
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        name: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      };
    } finally {
      setPicking(false);
    }
  }, []);

  return { pickFromGallery, picking };
}
