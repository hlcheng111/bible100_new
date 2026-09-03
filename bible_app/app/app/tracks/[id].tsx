import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { TrackingEngine, statusLabel } from '@bible-app/core';
import { useSettings } from '../../src/contexts/SettingsContext';
import { useProgress } from '../../src/contexts/ProgressContext';
import { themeForPersona } from '../../src/theme/personaTheme';

export default function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);
  const { engine } = useProgress();
  const track = TrackingEngine.getTrack(id ?? '');
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!engine || !track) return;
    (async () => {
      const map: Record<string, string> = {};
      for (const u of track.units.slice(0, 50)) {
        const p = await engine.getProgress(u.unitId);
        map[u.unitId] = p.status;
      }
      setStatusMap(map);
    })();
  }, [engine, track]);

  if (!track) {
    return (
      <View style={styles.centered}>
        <Text>Track not found</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      data={track.units}
      keyExtractor={(item) => item.unitId}
      initialNumToRender={30}
      renderItem={({ item }) => {
        const st = statusMap[item.unitId] ?? 'unread';
        const label = statusLabel(st as 'unread' | 'in_progress' | 'completed', locale === 'zh-Hant' ? 'zh-Hant' : 'en');
        return (
          <Pressable
            style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push(`/read/${item.unitId}`)}
          >
            <Text style={{ color: theme.text, flex: 1 }}>
              {locale === 'zh-Hant' ? item.bookNameZh : item.bookNameEn} {item.chapter}
            </Text>
            <Text style={{ color: st === 'completed' ? theme.accent : theme.muted, fontSize: 12 }}>
              {label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
});
