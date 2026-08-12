import { useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { TrackingEngine, t } from '@bible-app/core';
import { BibleReader } from '../../src/components/BibleReader';
import { useSettings } from '../../src/contexts/SettingsContext';
import { useProgress } from '../../src/contexts/ProgressContext';
import { themeForPersona } from '../../src/theme/personaTheme';

export default function ReadScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);
  const { engine } = useProgress();
  const [done, setDone] = useState(false);
  const parsed = TrackingEngine.parseUnitId(unitId ?? '');
  const track = parsed ? TrackingEngine.getTrack(parsed.trackId) : undefined;
  const unit = track?.units.find((u) => u.unitId === unitId);

  useEffect(() => {
    if (!engine || !unitId) return;
    engine.openUnit(unitId).then(async (p) => setDone(p.status === 'completed'));
  }, [engine, unitId]);

  const onComplete = async () => {
    if (!engine || !unitId) return;
    await engine.markComplete(unitId);
    setDone(true);
  };

  if (!parsed || !unit) {
    return (
      <View style={styles.centered}>
        <Text>Invalid unit</Text>
      </View>
    );
  }

  const bookName = locale === 'zh-Hant' ? unit.bookNameZh : unit.bookNameEn;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BibleReader bookId={parsed.bookId} chapter={parsed.chapter} bookName={bookName} />
      <View style={styles.footer}>
        <Pressable
          style={[styles.promptBtn, { borderColor: theme.primary }]}
          onPress={() => router.push(`/prompt/${parsed.bookId}?chapter=${parsed.chapter}`)}
        >
          <Text style={{ color: theme.primary }}>AI Prompt</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, { backgroundColor: done ? theme.muted : theme.primary }]}
          onPress={onComplete}
          disabled={done}
        >
          <Text style={styles.btnText}>{done ? '✓' : t('markComplete', locale)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  promptBtn: { padding: 14, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
