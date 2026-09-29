import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useKidsRunner } from '../../src/hooks/useKidsRunner';
import { SquadBar } from '../../src/components/kids/SquadBar';
import { BubbleButton } from '../../src/components/kids/BubbleButton';
import { uiForRunner } from '../../src/theme/kidsUiTheme';

const SQUAD = [
  { emoji: '🦁', name: '我', done: false },
  { emoji: '👧', name: '小美', done: true },
  { emoji: '👦', name: '小杰', done: true },
  { emoji: '🧑', name: '叔叔', done: false },
];

export default function HomeTab() {
  const { runner, todayUnit, percent, refresh, ready } = useKidsRunner();
  const ui = uiForRunner(runner);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!ready || !todayUnit) {
    return (
      <View style={[styles.centered, { backgroundColor: ui.bg }]}>
        <Text style={styles.loading}>載入中…</Text>
      </View>
    );
  }

  const squadDone = Math.min(100, percent + 25);
  const squadMembers = SQUAD.map((m, i) => ({
    ...m,
    done: i === 0 ? percent > 0 : m.done,
  }));

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: ui.bg }]} contentContainerStyle={styles.pad}>
      <View style={[styles.banner, { backgroundColor: todayUnit.colors.primary }]}>
        <Text style={styles.bannerEmoji}>{ui.mascot}</Text>
        <Text style={styles.bannerHi}>
          {runner === 'kids' ? '哈囉小勇士！' : '嗨，闖關者！'}
        </Text>
        <Text style={styles.bannerSub}>今天也要開心跑喔</Text>
      </View>

      <View style={[styles.todayCard, { borderColor: todayUnit.colors.accent }]}>
        <Text style={styles.todayLabel}>⭐ 今日冒險</Text>
        <Text style={styles.todayEmoji}>{todayUnit.heroEmoji}</Text>
        <Text style={styles.todayTitle}>{todayUnit.titleZh}</Text>
        <Text style={styles.todayMeta}>
          約 {todayUnit.minutes} 分鐘 · {todayUnit.oneLineZh}
        </Text>
        <BubbleButton
          label="出發！"
          emoji="📖"
          color={todayUnit.colors.primary}
          onPress={() => router.push(`/unit/${todayUnit.unitId}`)}
          style={{ width: '100%', marginTop: 16 }}
        />
      </View>

      <SquadBar members={squadMembers} percent={squadDone} />

      <View style={styles.quickRow}>
        <Pressable style={styles.quick} onPress={() => router.push('/bible')}>
          <Text style={styles.quickEmoji}>📖</Text>
          <Text style={styles.quickText}>66 卷</Text>
        </Pressable>
        <Pressable style={styles.quick} onPress={() => router.push('/(tabs)/map')}>
          <Text style={styles.quickEmoji}>🗺️</Text>
          <Text style={styles.quickText}>看地圖</Text>
        </Pressable>
        <Pressable style={styles.quick} onPress={() => router.push('/(tabs)/prizes')}>
          <Text style={styles.quickEmoji}>🏅</Text>
          <Text style={styles.quickText}>我的貼紙</Text>
        </Pressable>
        <Pressable style={styles.quick} onPress={() => router.push('/hub/pick-mode')}>
          <Text style={styles.quickEmoji}>📅</Text>
          <Text style={styles.quickText}>讀經方式</Text>
        </Pressable>
      </View>

      <Text style={styles.progress}>你已經跑了 {percent}% 啦！繼續加油！</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { fontSize: 18 },
  banner: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerEmoji: { fontSize: 56 },
  bannerHi: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 8 },
  bannerSub: { fontSize: 16, color: '#fff', opacity: 0.9 },
  todayCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 4,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  todayLabel: { fontSize: 14, fontWeight: '800', color: '#5C4D7A', alignSelf: 'flex-start' },
  todayEmoji: { fontSize: 72, marginVertical: 8 },
  todayTitle: { fontSize: 24, fontWeight: '900', color: '#2D1B4E', textAlign: 'center' },
  todayMeta: { fontSize: 15, color: '#5C4D7A', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quick: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  quickEmoji: { fontSize: 28 },
  quickText: { fontSize: 13, fontWeight: '700', marginTop: 4, color: '#2D1B4E' },
  progress: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#5C4D7A',
  },
});
