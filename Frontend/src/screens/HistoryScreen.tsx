/**
 * HistoryScreen — searchable, filterable, infinite list of detections with an
 * aggregate summary and backend PDF export.
 */
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

import {
  AppText,
  Card,
  EmptyState,
  ErrorView,
  FilterChip,
  Header,
  HistoryCard,
  HistoryCardSkeleton,
  PrimaryButton,
  Screen,
  SearchBar,
} from '@/components';
import { summaryPdfUrl } from '@/api/report.api';
import { HISTORY_FILTERS } from '@/constants/disease';
import { useDebounce } from '@/hooks/useDebounce';
import { useHistory } from '@/hooks/useHistory';
import { useSummary } from '@/hooks/useSummary';
import type { RootStackParamList } from '@/navigation/types';
import { downloadAndShare } from '@/services/download';
import { flushQueue } from '@/services/offlineQueue';
import { useHistoryStore } from '@/store/historyStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import { diseaseColor } from '@/theme/colors';
import type { Detection, DiseaseKey, HistoryQuery } from '@/types';
import { toAppError } from '@/utils/errors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, spacing } = useAppTheme();

  const filter = useHistoryStore((s) => s.filter);
  const search = useHistoryStore((s) => s.search);
  const setFilter = useHistoryStore((s) => s.setFilter);
  const setSearch = useHistoryStore((s) => s.setSearch);
  const debouncedSearch = useDebounce(search, 350);

  const query: HistoryQuery = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      disease: filter === 'all' ? undefined : (filter as DiseaseKey),
    }),
    [debouncedSearch, filter],
  );

  const history = useHistory(query);
  const summary = useSummary();
  const [snack, setSnack] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const items = useMemo(
    () => history.data?.pages.flatMap((p) => p.items) ?? [],
    [history.data],
  );

  const onExport = async () => {
    try {
      setExporting(true);
      const res = await downloadAndShare(
        summaryPdfUrl(query),
        'oyster_summary_report.pdf',
      );
      if (!res.shared) setSnack('Report saved to app storage.');
    } catch (err) {
      setSnack(toAppError(err).message);
    } finally {
      setExporting(false);
    }
  };

  const renderHeader = () => (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by Rack ID / Bag ID"
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {HISTORY_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            accent={f.value === 'all' ? undefined : diseaseColor(colors, f.value)}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ gap: spacing.lg, paddingTop: spacing.lg }}>
      {history.isFetchingNextPage ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {summary.data ? (
        <Card tone="card" level={1}>
          <SummaryRow label="Total Detections" value={summary.data.total} />
          <SummaryRow
            label="Contaminated Cases"
            value={summary.data.contaminated}
            color={colors.greenMold}
          />
          <SummaryRow
            label="Healthy Cases"
            value={summary.data.healthy}
            color={colors.healthy}
          />
        </Card>
      ) : null}

      <PrimaryButton
        label="Export Report"
        icon="download"
        loading={exporting}
        onPress={onExport}
      />
    </View>
  );

  return (
    <Screen>
      <Header title="History & Reports" />
      {history.isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {renderHeader()}
          {Array.from({ length: 4 }).map((_, i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </View>
      ) : history.isError ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <ErrorView error={toAppError(history.error)} onRetry={() => history.refetch()} />
        </View>
      ) : (
        <FlashList<Detection>
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No records found"
              message="Try a different search or filter, or capture a new detection."
            />
          }
          ListFooterComponent={items.length ? renderFooter() : null}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (history.hasNextPage && !history.isFetchingNextPage) history.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={history.isRefetching && !history.isFetchingNextPage}
              onRefresh={async () => {
                await flushQueue();
                history.refetch();
                summary.refetch();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            />
          )}
        />
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={3200}>
        {snack ?? ''}
      </Snackbar>
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const { spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
      }}
    >
      <AppText variant="bodyStrong" color="textMuted">
        {label}
      </AppText>
      <AppText variant="title" style={color ? { color } : undefined}>
        {value}
      </AppText>
    </View>
  );
}
