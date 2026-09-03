import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { AUDIENCES } from '@bible-app/core';
import { HubCard } from '../../src/components/hub/HubCard';
import { setAudience } from '../../src/storage/hubPreferences';
import { setRunner } from '../../src/storage/kidsProgress';
import { kidsUi } from '../../src/theme/kidsUiTheme';
import type { AudienceId } from '@bible-app/core';

export default function PickPersonaScreen() {
  const pick = async (id: AudienceId) => {
    await setAudience(id);
    if (id === 'kids') {
      await setRunner('kids');
      router.replace('/(tabs)/home');
    } else if (id === 'youth') {
      await setRunner('youth');
      router.replace('/(tabs)/home');
    } else {
      router.push('/hub/pick-mode');
    }
  };

  const primary = AUDIENCES.filter((a) => a.isKidsPrimary);
  const secondary = AUDIENCES.filter((a) => !a.isKidsPrimary);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>你是哪一種跑者？</Text>
      <Text style={styles.sub}>兒少優先 · 其他功能在「更多」也可找到</Text>

      <Text style={styles.section}>🌟 開心跑（主線）</Text>
      {primary.map((a) => (
        <HubCard
          key={a.id}
          emoji={a.emoji}
          title={a.nameZh}
          desc={a.descZh}
          color={a.color}
          onPress={() => pick(a.id)}
        />
      ))}

      <Text style={[styles.section, { marginTop: 8 }]}>📘 其他對象</Text>
      {secondary.map((a) => (
        <HubCard
          key={a.id}
          emoji={a.emoji}
          title={a.nameZh}
          desc={a.descZh}
          color={a.color}
          onPress={() => pick(a.id)}
          compact
        />
      ))}

      <Text style={styles.hint} onPress={() => router.push('/hub/pick-mode')}>
        或直接選讀經方式 →
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: kidsUi.text, marginBottom: 6 },
  sub: { fontSize: 15, color: kidsUi.textLight, marginBottom: 20 },
  section: { fontSize: 16, fontWeight: '800', color: kidsUi.text, marginBottom: 10 },
  hint: { textAlign: 'center', marginTop: 20, color: '#818CF8', fontWeight: '700', fontSize: 16 },
});
