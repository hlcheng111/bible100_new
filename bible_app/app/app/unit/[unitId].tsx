import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { getUnit } from '@bible-app/core';
import { getBibleService } from '../../src/bible/SqliteBibleService';
import { BubbleButton } from '../../src/components/kids/BubbleButton';

export default function UnitReadScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const unit = unitId ? getUnit(unitId) : undefined;
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unit) return;
    (async () => {
      const svc = await getBibleService();
      const ch = await svc.getChapter(unit.bookId, unit.chapter);
      setVerses(ch.primary.map((v) => `${v.v}. ${v.t}`));
      if (!ch.primary.length) {
        setVerses([`（經文：${unit.bookLabelZh} 第 ${unit.chapter} 章 — 請在補給站閱讀全文）`]);
      }
      setLoading(false);
    })();
  }, [unit]);

  if (!unit) {
    return (
      <View style={styles.centered}>
        <Text>找不到這一關</Text>
      </View>
    );
  }

  const c = unit.colors;

  return (
    <>
      <Stack.Screen
        options={{
          title: `第 ${unit.order} 關`,
          headerStyle: { backgroundColor: c.secondary },
          headerTintColor: '#2D1B4E',
        }}
      />
      <ScrollView style={[styles.scroll, { backgroundColor: c.secondary }]}>
        <View style={[styles.hero, { backgroundColor: c.primary }]}>
          <Text style={styles.heroEmoji}>{unit.heroEmoji}</Text>
          <Text style={styles.heroTitle}>{unit.titleZh}</Text>
          <Text style={styles.heroMeta}>
            {unit.bookLabelZh} {unit.chapter} 章 · 約 {unit.minutes} 分鐘
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>📖 故事時間</Text>
          <Text style={styles.story}>{unit.storyZh}</Text>

          <Text style={[styles.section, { marginTop: 20 }]}>✨ 今日金句</Text>
          <Text style={styles.oneLine}>{unit.oneLineZh}</Text>

          <Text style={[styles.section, { marginTop: 20 }]}>📜 聖經經文</Text>
          {loading ? (
            <ActivityIndicator color={c.primary} />
          ) : (
            verses.map((line) => (
              <Text key={line} style={styles.verse}>
                {line}
              </Text>
            ))
          )}

          <Text style={[styles.section, { marginTop: 20 }]}>🎯 今天可以做</Text>
          <Text style={styles.action}>{unit.actionZh}</Text>
        </View>

        <View style={styles.footer}>
          <BubbleButton
            label="玩小遊戲！"
            emoji="🎮"
            color={c.accent}
            onPress={() =>
              router.push({ pathname: '/unit/game', params: { unitId: unit.unitId } })
            }
            style={{ width: '100%', marginBottom: 12 }}
          />
          <BubbleButton
            label="去補給站深入"
            color="#94A3B8"
            onPress={() => Linking.openURL(unit.supplyUrl)}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: 28, alignItems: 'center' },
  heroEmoji: { fontSize: 80 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 8 },
  heroMeta: { fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -16,
    padding: 24,
    minHeight: 400,
  },
  section: { fontSize: 18, fontWeight: '900', color: '#2D1B4E', marginBottom: 8 },
  story: { fontSize: 18, lineHeight: 30, color: '#2D1B4E' },
  oneLine: {
    fontSize: 17,
    fontWeight: '700',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    padding: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  verse: { fontSize: 16, lineHeight: 26, color: '#374151', marginBottom: 6 },
  action: { fontSize: 17, lineHeight: 26, color: '#059669', fontWeight: '600' },
  footer: { padding: 24, backgroundColor: '#fff' },
});
