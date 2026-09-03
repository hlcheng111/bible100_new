import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { TrackingEngine, t } from '@bible-app/core';
import { useSettings } from '../../src/contexts/SettingsContext';
import { useProgress } from '../../src/contexts/ProgressContext';
import { themeForPersona } from '../../src/theme/personaTheme';

export default function TracksScreen() {
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);
  const { engine } = useProgress();
  const tracks = TrackingEngine.getTracks();
  const [summaries, setSummaries] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!engine) return;
    (async () => {
      const map: Record<string, number> = {};
      for (const tr of tracks) {
        const s = await engine.getTrackSummary(tr.id);
        map[tr.id] = s.percent;
      }
      setSummaries(map);
    })();
  }, [engine, tracks]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>{t('tracks', locale)}</Text>
      {tracks.map((tr) => (
        <Pressable
          key={tr.id}
          style={[styles.card, { backgroundColor: theme.card, borderRadius: theme.borderRadius }]}
          onPress={() => router.push(`/tracks/${tr.id}`)}
        >
          <Text style={[styles.cardTitle, { color: theme.primary }]}>
            {locale === 'zh-Hant' ? tr.nameZh : tr.nameEn}
          </Text>
          <Text style={{ color: theme.muted }}>
            {tr.unitCount} {locale === 'zh-Hant' ? '章' : 'chapters'} · {summaries[tr.id] ?? 0}%
          </Text>
          <View style={[styles.bar, { backgroundColor: theme.border }]}>
            <View
              style={[styles.barFill, { width: `${summaries[tr.id] ?? 0}%`, backgroundColor: theme.accent }]}
            />
          </View>
        </Pressable>
      ))}
      <Pressable onPress={() => router.push('/settings')}>
        <Text style={[styles.link, { color: theme.accent }]}>{t('settings', locale)}</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/church')}>
        <Text style={[styles.link, { color: theme.accent }]}>{t('churchDashboard', locale)}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  card: { padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  bar: { height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%' },
  link: { marginTop: 16, fontSize: 16 },
});
