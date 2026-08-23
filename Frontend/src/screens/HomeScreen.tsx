/**
 * HomeScreen — farm overview dashboard.
 * "Disease Detection" is wired to the existing Capture flow; the other tiles
 * are placeholders for features not built yet.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Linking, Platform, ScrollView, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { AppText, BotanicalAccent, Card, QuickAccessTile, Screen } from '@/components';
import type { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/theme/ThemeProvider';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const FARM = { temperature: '24.6 °C', humidity: '78 %' };

const GROWTH_STAGE_URL = 'https://shroomboard.private-staging.vip/login';

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, spacing, radius } = useAppTheme();
  const [snack, setSnack] = useState<string | null>(null);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['4xl'], gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="hero">Hello, Farmer!</AppText>
              <AppText variant="body" color="textMuted" style={{ marginTop: 2 }}>
                Here&apos;s your farm overview
              </AppText>
            </View>
            <MaterialCommunityIcons
              name="mushroom"
              size={56}
              color={colors.primarySoft}
              style={{ opacity: 0.85 }}
            />
          </View>
        </View>

        {/* Environment stats */}
        <Card padded>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Stat icon="thermometer" value={FARM.temperature} label="Temperature" />
            <View style={{ width: 1, height: 44, backgroundColor: colors.border }} />
            <Stat icon="water-outline" value={FARM.humidity} label="Humidity" />
          </View>
        </Card>

        {/* Quick access */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="h2">Quick Access</AppText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: spacing.md,
            }}
          >
            <QuickAccessTile
              icon="shield-check-outline"
              label="Disease Detection"
              onPress={() =>
                navigation.navigate('DiseaseDetection', { screen: 'Capture' })
              }
            />
            <QuickAccessTile
              icon="mushroom-outline"
              label="Growth Stage Detection"
              onPress={() => {
                if (Platform.OS === 'web') {
                  Linking.openURL(GROWTH_STAGE_URL);
                } else {
                  navigation.navigate('WebView', {
                    url: GROWTH_STAGE_URL,
                    title: 'Growth Stage Detection',
                  });
                }
              }}
            />
            <QuickAccessTile
              icon="water-outline"
              label="Moisture Stress Monitoring"
              available={false}
              onPress={() => setSnack('Moisture Stress Monitoring is coming soon.')}
            />
            <QuickAccessTile
              icon="molecule-co2"
              label="CO₂ Stress Monitoring"
              available={false}
              onPress={() => setSnack('CO₂ Stress Monitoring is coming soon.')}
            />
          </View>
        </View>
      </ScrollView>

      <BotanicalAccent
        size={160}
        color={colors.primarySoft}
        opacity={0.08}
        style={{ position: 'absolute', left: -30, bottom: -20 }}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={2600}>
        {snack ?? ''}
      </Snackbar>
    </Screen>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  label: string;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.sm,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 15,
          backgroundColor: colors.healthySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View>
        <AppText variant="h2">{value}</AppText>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
      </View>
    </View>
  );
}
