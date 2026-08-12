import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { BubbleButton } from '../src/components/kids/BubbleButton';
import { kidsUi } from '../src/theme/kidsUiTheme';
import { getCompletedIds } from '../src/storage/kidsProgress';

const DECO = [
  { e: '📖', label: '66 卷書目', route: '/bible' as const },
  { e: '⭐', label: '100 金句', route: '/modes/golden-verses' as const },
  { e: '🎮', label: '關卡地圖', route: '/(tabs)/map' as const },
  { e: '🏅', label: '貼紙獎品', route: '/(tabs)/prizes' as const },
];

export default function WelcomeScreen() {
  const onReturn = async () => {
    const done = await getCompletedIds();
    if (done.length > 0) {
      router.replace('/(tabs)/home');
    } else {
      router.push('/hub/pick-mode');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.sky}>
        <Text style={styles.cloud}>☁️</Text>
        <Text style={styles.cloud2}>🌈</Text>
        <Text style={styles.mascot}>{kidsUi.mascot}</Text>
        <Text style={styles.wave}>👋</Text>
      </View>

      <Text style={styles.title}>嗨！歡迎來玩！</Text>
      <Text style={styles.sub}>
        和好朋友一起讀聖經故事{'\n'}
        開心跑 · 拿貼紙 · 你跑我追
      </Text>

      <View style={styles.decoRow}>
        {DECO.map((d) => (
          <Pressable key={d.e} style={styles.decoBubble} onPress={() => router.push(d.route)}>
            <Text style={styles.decoEmoji}>{d.e}</Text>
            <Text style={styles.decoLabel}>{d.label}</Text>
          </Pressable>
        ))}
      </View>

      <BubbleButton
        label="開始冒險！"
        emoji="🚀"
        color="#FF6B6B"
        onPress={() => router.push('/hub/pick-persona')}
        style={styles.mainBtn}
      />

      <BubbleButton
        label="選讀經方式"
        color="#818CF8"
        onPress={() => router.push('/hub/pick-mode')}
        style={styles.secondBtn}
      />

      <BubbleButton
        label="我已經來過了"
        color="#4ECDC4"
        onPress={onReturn}
        style={styles.secondBtn}
      />

      <Text style={styles.footer}>不用註冊 · 66 卷書目 · 30 日 · 金句 · 主題</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  container: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  sky: {
    width: '100%',
    height: 200,
    backgroundColor: kidsUi.bgAlt,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#FFE66D',
  },
  cloud: { position: 'absolute', top: 20, left: 24, fontSize: 36 },
  cloud2: { position: 'absolute', top: 16, right: 28, fontSize: 32 },
  mascot: { fontSize: 88 },
  wave: { position: 'absolute', bottom: 16, right: 40, fontSize: 40 },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: kidsUi.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sub: {
    fontSize: 18,
    lineHeight: 28,
    color: kidsUi.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  decoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28, justifyContent: 'center' },
  decoBubble: {
    width: 72,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: '#F472B6',
  },
  decoEmoji: { fontSize: 28 },
  decoLabel: { fontSize: 10, fontWeight: '700', color: kidsUi.textLight, marginTop: 4, textAlign: 'center' },
  mainBtn: { width: '100%', marginBottom: 12 },
  secondBtn: { width: '100%', marginBottom: 10 },
  footer: { marginTop: 16, fontSize: 13, color: kidsUi.textLight, textAlign: 'center' },
});
