import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { READING_MODES, type ReadingModeId } from '@bible-app/core';
import { HubCard } from '../../src/components/hub/HubCard';
import { setLastMode } from '../../src/storage/hubPreferences';
import { kidsUi } from '../../src/theme/kidsUiTheme';

const ROUTES: Record<ReadingModeId, string> = {
  bible66: '/bible',
  thirty_day: '/modes/thirty-day',
  golden_100: '/modes/golden-verses',
  thematic: '/modes/thematic',
};

export default function PickModeScreen() {
  const pick = async (id: ReadingModeId) => {
    await setLastMode(id);
    router.push(ROUTES[id] as '/bible');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>選讀經方式</Text>
      <Text style={styles.sub}>66 卷書目 · 30 日 · 100 金句 · 主題 — 可自由切換</Text>

      {READING_MODES.map((m) => (
        <HubCard
          key={m.id}
          emoji={m.emoji}
          title={m.nameZh}
          desc={m.descZh}
          color={m.color}
          onPress={() => pick(m.id)}
        />
      ))}

      <Text style={styles.hint} onPress={() => router.push('/hub/pick-persona')}>
        ← 換一種跑者對象
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: kidsUi.text, marginBottom: 6 },
  sub: { fontSize: 15, color: kidsUi.textLight, marginBottom: 20, lineHeight: 22 },
  hint: { textAlign: 'center', marginTop: 16, color: '#818CF8', fontWeight: '700', fontSize: 16 },
});
