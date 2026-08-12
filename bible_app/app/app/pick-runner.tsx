import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { setRunner } from '../src/storage/kidsProgress';
import { kidsUi } from '../src/theme/kidsUiTheme';

export default function PickRunnerScreen() {
  const pick = async (type: 'kids' | 'youth') => {
    await setRunner(type);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>你是哪一種跑者？</Text>
      <Text style={styles.sub}>選一個最像你的（隨時可改）</Text>

      <Pressable style={[styles.card, { borderColor: '#FF6B6B' }]} onPress={() => pick('kids')}>
        <Text style={styles.cardEmoji}>🦁</Text>
        <Text style={styles.cardTitle}>兒童開心跑</Text>
        <Text style={styles.cardDesc}>故事、貼紙、大大的圖{'\n'}20 個聖經冒險關卡</Text>
      </Pressable>

      <Pressable style={[styles.card, { borderColor: '#818CF8' }]} onPress={() => pick('youth')}>
        <Text style={styles.cardEmoji}>🚀</Text>
        <Text style={styles.cardTitle}>少年闖關跑</Text>
        <Text style={styles.cardDesc}>闖關、勳章、和朋友一起追{'\n'}15 個信仰挑戰關卡</Text>
      </Pressable>

      <Text style={styles.hint}>爸媽、老師也可以一起同跑隊喔 👨‍👩‍👧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kidsUi.bg,
    padding: 24,
    paddingTop: 56,
  },
  title: { fontSize: 28, fontWeight: '900', color: kidsUi.text, marginBottom: 8 },
  sub: { fontSize: 16, color: kidsUi.textLight, marginBottom: 28 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 4,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardEmoji: { fontSize: 64, marginBottom: 12 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: kidsUi.text },
  cardDesc: {
    fontSize: 16,
    color: kidsUi.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  hint: { textAlign: 'center', marginTop: 12, fontSize: 15, color: kidsUi.textLight },
});
