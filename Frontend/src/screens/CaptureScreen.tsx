/**
 * CaptureScreen — capture/upload an image, enter Rack/Bag/Notes, run detection,
 * and auto-save the result to history.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { z } from 'zod';

import {
  AppInput,
  Header,
  ImageUploader,
  LoadingOverlay,
  PredictionCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  ThemeToggle,
  AppText,
} from '@/components';
import { useImagePicker } from '@/hooks/useImagePicker';
import { usePredict, useSaveBag } from '@/hooks/useMutations';
import type { RootStackParamList } from '@/navigation/types';
import { enqueueBag } from '@/services/offlineQueue';
import { usePredictionStore } from '@/store/predictionStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import { toAppError } from '@/utils/errors';
import type { BagCreate } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const schema = z.object({
  // Rack IDs look like R01, R02, R010; bags like B01, B03.
  rackId: z
    .string()
    .trim()
    .regex(/^R\d+$/i, 'Rack ID must be like R01, R02'),
  bagId: z
    .string()
    .trim()
    .regex(/^B\d+$/i, 'Bag ID must be like B01, B03'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CaptureScreen() {
  const navigation = useNavigation<Nav>();
  const { spacing } = useAppTheme();
  const { pickFromGallery, picking } = useImagePicker();

  const image = usePredictionStore((s) => s.image);
  const result = usePredictionStore((s) => s.result);
  const saved = usePredictionStore((s) => s.saved);
  const setImage = usePredictionStore((s) => s.setImage);
  const setResult = usePredictionStore((s) => s.setResult);
  const setSaved = usePredictionStore((s) => s.setSaved);
  const reset = usePredictionStore((s) => s.reset);

  const predict = usePredict();
  const saveBag = useSaveBag();
  const [snack, setSnack] = useState<string | null>(null);

  const { control, handleSubmit, reset: resetForm } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rackId: '', bagId: '', notes: '' },
  });

  const busy = predict.isPending || saveBag.isPending;

  const onSubmit = async (values: FormValues) => {
    if (!image) {
      setSnack('Please capture or upload an image first.');
      return;
    }
    try {
      const prediction = await predict.mutateAsync({
        uri: image.uri,
        name: image.name,
        type: image.mimeType,
      });
      setResult(prediction);

      const top = prediction.detections.reduce<null | (typeof prediction.detections)[number]>(
        (best, d) => (!best || d.confidence > best.confidence ? d : best),
        null,
      );

      const payload: BagCreate = {
        rack_id: values.rackId.trim().toUpperCase(),
        bag_id: values.bagId.trim().toUpperCase(),
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        notes: values.notes?.trim() || null,
        image: prediction.annotated_image ?? null,
        bbox: top?.bbox ?? null,
        image_width: prediction.image_size?.width ?? 0,
        image_height: prediction.image_size?.height ?? 0,
        inference_time_ms: prediction.inference_time_ms ?? null,
      };

      try {
        const record = await saveBag.mutateAsync(payload);
        setSaved(record);
        setSnack(`Saved to Rack ${record.rack_name} • Bag ${record.bag_id}`);
      } catch (saveErr) {
        const appErr = toAppError(saveErr);
        setSaved(null);
        // Only queue on connectivity failures. A duplicate (409) or validation
        // error is a permanent rejection — surface it, don't retry silently.
        if (appErr.kind === 'network' || appErr.kind === 'timeout') {
          await enqueueBag(payload);
          setSnack(`${appErr.message} Result queued to sync later.`);
        } else {
          setSnack(appErr.message);
        }
      }
    } catch (err) {
      setSnack(toAppError(err).message);
    }
  };

  const startNew = () => {
    reset();
    resetForm();
  };

  return (
    <Screen>
      <Header
        title="Capture Image"
        subtitle="Capture or upload a mushroom bag image"
        right={<ThemeToggle />}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing['4xl'],
            gap: spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImageUploader uri={image?.uri} onPress={() => navigation.navigate('Camera')} />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Open Camera"
                icon="camera"
                onPress={() => navigation.navigate('Camera')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SecondaryButton
                label="Gallery"
                icon="images"
                loading={picking}
                onPress={async () => {
                  const picked = await pickFromGallery();
                  if (picked) setImage(picked);
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="rackId"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Rack ID"
                    placeholder="Enter Rack ID (Format: R01)"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value={field.value}
                    onChangeText={(t) => field.onChange(t.toUpperCase())}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="bagId"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Bag ID"
                    placeholder="Enter Bag ID (Format: B01)"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value={field.value}
                    onChangeText={(t) => field.onChange(t.toUpperCase())}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <AppInput
                label="Notes"
                optional
                placeholder="Enter any additional notes"
                multiline
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          {result ? (
            <PredictionCard
              prediction={result.prediction}
              confidence={result.confidence}
            />
          ) : null}

          {saved ? (
            <View style={{ gap: spacing.md }}>
              <AppText variant="caption" color="healthy" center>
                ✓ Detection saved to history
              </AppText>
              <SecondaryButton label="New Capture" icon="add" onPress={startNew} />
            </View>
          ) : (
            <PrimaryButton
              label="Submit for Detection"
              loading={busy}
              onPress={handleSubmit(onSubmit)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay
        visible={busy}
        message={predict.isPending ? 'Analyzing image…' : 'Saving result…'}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={3200}>
        {snack ?? ''}
      </Snackbar>
    </Screen>
  );
}
