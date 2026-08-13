/**
 * DetailScreen — full detection record with export / share / delete.
 * The image shown is the server's annotated image (boxes already drawn).
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

import {
  AppText,
  Card,
  ConfirmationDialog,
  ErrorView,
  Header,
  PredictionCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Skeleton,
  StatusBadge,
} from '@/components';
import { singlePdfUrl } from '@/api/report.api';
import { absoluteImageUrl } from '@/constants/config';
import { useHistoryItem } from '@/hooks/useHistory';
import { useDeleteHistory } from '@/hooks/useMutations';
import type { RootStackParamList } from '@/navigation/types';
import { downloadAndShare } from '@/services/download';
import { useAppTheme } from '@/theme/ThemeProvider';
import { toAppError } from '@/utils/errors';
import { formatConfidence, formatDateTime } from '@/utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
type Rt = RouteProp<RootStackParamList, 'Detail'>;

export function DetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const { colors, radius, spacing } = useAppTheme();

  const item = useHistoryItem(params.id);
  const del = useDeleteHistory();
  const [confirm, setConfirm] = useState(false);
  const [busyExport, setBusyExport] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const data = item.data;
  const uri = absoluteImageUrl(data?.image_url);

  const exportPdf = async () => {
    try {
      setBusyExport(true);
      const res = await downloadAndShare(
        singlePdfUrl(params.id),
        `report_${String(params.id).padStart(5, '0')}.pdf`,
      );
      if (!res.shared) setSnack('Report saved to app storage.');
    } catch (err) {
      setSnack(toAppError(err).message);
    } finally {
      setBusyExport(false);
    }
  };

  const onDelete = async () => {
    try {
      await del.mutateAsync(params.id);
      setConfirm(false);
      navigation.goBack();
    } catch (err) {
      setConfirm(false);
      setSnack(toAppError(err).message);
    }
  };

  return (
    <Screen>
      <Header title="Detection Details" onBack={() => navigation.goBack()} />

      {item.isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={240} radius={radius.xl} />
          <Skeleton width="60%" height={22} />
          <Skeleton width="40%" height={16} />
        </View>
      ) : item.isError || !data ? (
        <ErrorView error={toAppError(item.error)} onRetry={() => item.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing['4xl'],
            gap: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              height: 260,
              borderRadius: radius.xl,
              overflow: 'hidden',
              backgroundColor: colors.cardAlt,
            }}
          >
            {uri ? (
              <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" transition={220} />
            ) : null}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <AppText variant="title">{data.disease_display}</AppText>
              {data.scientific_name ? (
                <AppText variant="body" color="textMuted">
                  ({data.scientific_name})
                </AppText>
              ) : null}
            </View>
            <StatusBadge status={data.prediction} />
          </View>

          <PredictionCard prediction={data.prediction} confidence={data.confidence} />

          <Card>
            <Row label="Rack ID" value={data.rack_name} />
            <Row label="Bag ID" value={data.bag_id} />
            <Row label="Confidence" value={formatConfidence(data.confidence)} />
            <Row
              label="Bounding Box"
              value={data.bbox ? data.bbox.map((n: number) => Math.round(n)).join(', ') : 'N/A'}
            />
            <Row
              label="Inference Time"
              value={data.inference_time_ms ? `${Math.round(data.inference_time_ms)} ms` : '—'}
            />
            <Row label="Detected" value={formatDateTime(data.captured_at)} last />
          </Card>

          {data.notes ? (
            <Card>
              <AppText variant="label" color="textMuted">
                Notes
              </AppText>
              <AppText variant="body" style={{ marginTop: spacing.xs }}>
                {data.notes}
              </AppText>
            </Card>
          ) : null}

          <View style={{ gap: spacing.md }}>
            <PrimaryButton
              label="Export PDF"
              icon="document-text"
              loading={busyExport}
              onPress={exportPdf}
            />
            <SecondaryButton label="Share Report" icon="share-social" onPress={exportPdf} />
            <SecondaryButton
              label="Delete Record"
              icon="trash"
              onPress={() => setConfirm(true)}
            />
          </View>
        </ScrollView>
      )}

      <ConfirmationDialog
        visible={confirm}
        title="Delete record?"
        message="This permanently removes the detection from history and tracking."
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirm(false)}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={3200}>
        {snack ?? ''}
      </Snackbar>
    </Screen>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: spacing.md,
      }}
    >
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodyStrong" style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </AppText>
    </View>
  );
}
