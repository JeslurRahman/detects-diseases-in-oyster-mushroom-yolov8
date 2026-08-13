/**
 * TrackingScreen — per-rack bag status grid with a detail bottom sheet.
 */
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import {
  AppText,
  Card,
  Dropdown,
  EmptyState,
  ErrorView,
  GridSkeleton,
  Header,
  Legend,
  PrimaryButton,
  RackGrid,
  Screen,
  StatisticsCard,
  StatusBadge,
} from '@/components';
import { absoluteImageUrl } from '@/constants/config';
import { useHistoryItem } from '@/hooks/useHistory';
import { useRackDetail, useRacks } from '@/hooks/useRacks';
import type { RootStackParamList } from '@/navigation/types';
import { useRackStore } from '@/store/rackStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import type { BagStatus, Rack } from '@/types';
import { toAppError } from '@/utils/errors';
import { formatConfidence, formatDateTime } from '@/utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TrackingScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, spacing } = useAppTheme();

  const racksQuery = useRacks();
  const selectedRackId = useRackStore((s) => s.selectedRackId);
  const setSelectedRack = useRackStore((s) => s.setSelectedRack);

  // default to the first rack once loaded
  useEffect(() => {
    if (selectedRackId == null && racksQuery.data?.length) {
      setSelectedRack(racksQuery.data[0]!.id);
    }
  }, [racksQuery.data, selectedRackId, setSelectedRack]);

  const detail = useRackDetail(selectedRackId);
  const sheetRef = useRef<BottomSheet>(null);
  const [selectedBag, setSelectedBag] = useState<BagStatus | null>(null);

  const onSelectBag = useCallback((bag: BagStatus) => {
    setSelectedBag(bag);
    sheetRef.current?.expand();
  }, []);

  const rackOptions = useMemo(
    () => (racksQuery.data ?? []).map((r: Rack) => ({ label: `Rack ${r.name}`, value: r.id })),
    [racksQuery.data],
  );

  const d = detail.data;

  return (
    <Screen>
      <Header title="Rack Tracking" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['4xl'], gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={detail.isRefetching}
            onRefresh={() => detail.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignSelf: 'flex-start' }}>
          <Dropdown
            options={rackOptions}
            value={selectedRackId}
            onChange={(v) => setSelectedRack(Number(v))}
            placeholder="Select rack"
          />
        </View>

        {detail.isLoading ? (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <StatisticsCard label="Total Bags" value="—" />
              <StatisticsCard label="Healthy Bags" value="—" />
              <StatisticsCard label="Infected Bags" value="—" />
            </View>
            <Card>
              <GridSkeleton />
            </Card>
          </>
        ) : detail.isError ? (
          <ErrorView error={toAppError(detail.error)} onRetry={() => detail.refetch()} />
        ) : d ? (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <StatisticsCard label="Total Bags" value={d.total_bags} />
              <StatisticsCard
                label="Healthy Bags"
                value={d.healthy}
                accent={colors.healthy}
              />
              <StatisticsCard
                label="Infected Bags"
                value={d.infected}
                accent={colors.greenMold}
                emphasis
              />
            </View>

            <AppText variant="caption" color="textMuted" center>
              Last Updated: {formatDateTime(d.last_updated)}
            </AppText>

            <Card>
              {d.bags.length ? (
                <RackGrid bags={d.bags} onSelect={onSelectBag} />
              ) : (
                <EmptyState
                  icon="cube-outline"
                  title="No bags yet"
                  message="Capture a detection for this rack to see it here."
                />
              )}
            </Card>

            <Card padded>
              <Legend />
            </Card>
          </>
        ) : null}
      </ScrollView>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['65%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
          {selectedBag ? (
            <BagDetail
              bag={selectedBag}
              onViewReport={(id) => {
                sheetRef.current?.close();
                navigation.navigate('Detail', { id });
              }}
            />
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>
    </Screen>
  );
}

function BagDetail({
  bag,
  onViewReport,
}: {
  bag: BagStatus;
  onViewReport: (id: number) => void;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const item = useHistoryItem(bag.detection_id);
  const uri = absoluteImageUrl(item.data?.image_url);

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <AppText variant="title">Bag {bag.bag_id}</AppText>
        <StatusBadge status={bag.status} />
      </View>

      <View
        style={{
          height: 200,
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: colors.cardAlt,
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" transition={200} />
        ) : null}
      </View>

      {item.data ? (
        <View style={{ gap: spacing.sm }}>
          <DetailRow label="Rack" value={item.data.rack_name} />
          <DetailRow label="Prediction" value={item.data.disease_display} />
          <DetailRow label="Confidence" value={formatConfidence(item.data.confidence)} />
          <DetailRow label="Detected" value={formatDateTime(item.data.captured_at)} />
          {item.data.notes ? <DetailRow label="Notes" value={item.data.notes} /> : null}
          <AppText variant="body" color="textMuted" style={{ marginTop: spacing.xs }}>
            {item.data.recommendation}
          </AppText>
          <PrimaryButton
            label="View Full Report"
            icon="document-text"
            onPress={() => onViewReport(bag.detection_id)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : (
        <AppText variant="body" color="textMuted">
          Loading details…
        </AppText>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodyStrong" style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </AppText>
    </View>
  );
}
