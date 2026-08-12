import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SquadBar } from '../../src/components/kids/SquadBar';
import { kidsUi } from '../../src/theme/kidsUiTheme';

const MEMBERS = [
  { emoji: '🦁', name: '我（隊長）', done: true, msg: '今天讀完了！' },
  { emoji: '👧', name: '小美', done: true, msg: '連續 5 天！' },
  { emoji: '👦', name: '小杰', done: false, msg: '差一點，加油！' },
  { emoji: '🧓', name: '阿公', done: true, msg: '陪你一起跑' },
];

export default function SquadTab() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>🏃 你跑我追</Text>
      <Text style={styles.sub}>和家人、朋友同跑隊，一起歡呼！</Text>

      <SquadBar
        members={MEMBERS.map((m) => ({ emoji: m.emoji, name: m.name, done: m.done }))}
        percent={75}
      />

      <View style={styles.list}>
        {MEMBERS.map((m) => (
          <View key={m.name} style={styles.row}>
            <Text style={styles.rowEmoji}>{m.emoji}</Text>
            <View style={styles.rowBody}>
              <Text style={styles.rowName}>{m.name}</Text>
              <Text style={styles.rowMsg}>{m.msg}</Text>
            </View>
            <Text style={m.done ? styles.done : styles.wait}>{m.done ? '✓' : '…'}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipTitle}>💡 小提示</Text>
        <Text style={styles.tipText}>
          邀請家人掃碼加入同跑隊（正式版上線後開放）。現在可以先和家人約好「今天讀同一關」！
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#2D1B4E' },
  sub: { fontSize: 15, color: '#5C4D7A', marginBottom: 16 },
  list: { marginTop: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  rowEmoji: { fontSize: 36, marginRight: 12 },
  rowBody: { flex: 1 },
  rowName: { fontSize: 17, fontWeight: '800', color: '#2D1B4E' },
  rowMsg: { fontSize: 14, color: '#5C4D7A', marginTop: 2 },
  done: { fontSize: 24, color: '#22C55E', fontWeight: '900' },
  wait: { fontSize: 24, color: '#D1D5DB' },
  tip: {
    marginTop: 24,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  tipTitle: { fontWeight: '800', fontSize: 16, marginBottom: 6 },
  tipText: { fontSize: 14, lineHeight: 22, color: '#5C4D7A' },
});
