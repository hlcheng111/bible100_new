import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { router } from 'expo-router';
import { READING_MODES, AUDIENCES } from '@bible-app/core';
import { BubbleButton } from '../../src/components/kids/BubbleButton';
import { HubCard } from '../../src/components/hub/HubCard';
import { kidsUi } from '../../src/theme/kidsUiTheme';

const SUPPLY = 'https://bible100.lovestoblog.com/languages/index_cn.html';

const MODE_ROUTES: Record<string, string> = {
  bible66: '/bible',
  thirty_day: '/modes/thirty-day',
  golden_100: '/modes/golden-verses',
  thematic: '/modes/thematic',
};

export default function MoreTab() {
  const secondary = AUDIENCES.filter((a) => !a.isKidsPrimary);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>✨ 更多</Text>
      <Text style={styles.sub}>讀經方式 · 其他對象 · 報名 · 獎品 · 遊戲</Text>

      <Text style={styles.section}>📖 讀經方式</Text>
      {READING_MODES.map((m) => (
        <Pressable
          key={m.id}
          style={styles.linkRow}
          onPress={() => router.push(MODE_ROUTES[m.id] as '/bible')}
        >
          <Text style={styles.linkEmoji}>{m.emoji}</Text>
          <View style={styles.linkMeta}>
            <Text style={styles.linkTitle}>{m.nameZh}</Text>
            <Text style={styles.linkDesc}>{m.descZh}</Text>
          </View>
        </Pressable>
      ))}

      <Text style={[styles.section, { marginTop: 8 }]}>👥 其他對象（解說 · 報名）</Text>
      {secondary.map((a) => (
        <HubCard
          key={a.id}
          emoji={a.emoji}
          title={a.nameZh}
          desc={a.descZh}
          color={a.color}
          compact
          onPress={() => router.push('/hub/pick-mode')}
          style={{ marginBottom: 10 }}
        />
      ))}

      <Text style={styles.section}>🎮 兒少遊戲 · 🏅 獎品</Text>
      <View style={styles.card}>
        <BubbleButton
          label="貼紙獎品牆"
          emoji="🏅"
          color="#FFE66D"
          onPress={() => router.push('/(tabs)/prizes')}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <BubbleButton
          label="冒險地圖關卡"
          emoji="🎮"
          color="#FF6B6B"
          onPress={() => router.push('/(tabs)/map')}
          style={{ width: '100%' }}
        />
      </View>

      <Text style={styles.section}>📚 補給站 · 進修</Text>
      <View style={[styles.card, { borderColor: '#4ECDC4' }]}>
        <Text style={styles.cardDesc}>Bible100 百步課程、深度教材、AI 工具</Text>
        <BubbleButton
          label="打開補給站"
          color="#4ECDC4"
          onPress={() => Linking.openURL(SUPPLY)}
          style={{ width: '100%', marginTop: 12 }}
        />
      </View>

      <Pressable style={styles.enroll} onPress={() => router.push('/hub/pick-persona')}>
        <Text style={styles.enrollText}>📝 報名 / 選對象 / 換跑道</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/settings')}>
        <Text style={styles.settings}>⚙️ 語言 · 譯本 · 設定</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: kidsUi.text, marginBottom: 4 },
  sub: { fontSize: 14, color: kidsUi.textLight, marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '800', color: kidsUi.text, marginBottom: 10 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  linkEmoji: { fontSize: 28, marginRight: 12 },
  linkMeta: { flex: 1 },
  linkTitle: { fontSize: 16, fontWeight: '800', color: kidsUi.text },
  linkDesc: { fontSize: 13, color: kidsUi.textLight, marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  cardDesc: { fontSize: 14, color: kidsUi.textLight, textAlign: 'center', lineHeight: 20 },
  enroll: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  enrollText: { fontWeight: '800', color: '#4338CA', fontSize: 16 },
  settings: { textAlign: 'center', color: '#64748B', fontWeight: '600', fontSize: 15 },
});
