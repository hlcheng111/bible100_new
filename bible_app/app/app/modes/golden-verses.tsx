import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { getGoldenVerses, type GoldenVerseEntry } from '@bible-app/core';
import { getBibleService } from '../../src/bible/SqliteBibleService';
import { kidsUi } from '../../src/theme/kidsUiTheme';

function VerseRow({ v }: { v: GoldenVerseEntry }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const svc = await getBibleService();
      const ch = await svc.getChapter(v.bookId, v.chapter);
      const verse = ch.primary.find((x) => x.v === v.verse);
      setText(verse?.t ?? `（${v.refZh} — 請在 66 卷書目閱讀完整章節）`);
    })();
  }, [v]);

  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: '/bible/read',
          params: { bookId: String(v.bookId), chapter: String(v.chapter) },
        })
      }
    >
      <Text style={styles.ref}>{v.refZh}</Text>
      <Text style={styles.tag}>{v.tagZh}</Text>
      {text ? (
        <Text style={styles.text} numberOfLines={3}>
          {text}
        </Text>
      ) : (
        <ActivityIndicator color={kidsUi.tabActive} style={{ marginTop: 8 }} />
      )}
    </Pressable>
  );
}

export default function GoldenVersesScreen() {
  const verses = getGoldenVerses();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '100 經文金句' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
        <Text style={styles.lead}>
          已收錄 {verses.length} 句（持續擴至 100）· 點擊可讀整章
        </Text>
        {verses.map((v) => (
          <VerseRow key={v.id} v={v} />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  lead: { fontSize: 15, color: kidsUi.textLight, marginBottom: 16, lineHeight: 22 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFE66D',
  },
  ref: { fontSize: 16, fontWeight: '900', color: '#B45309' },
  tag: { fontSize: 12, color: kidsUi.textLight, marginTop: 2 },
  text: { fontSize: 16, lineHeight: 24, color: kidsUi.text, marginTop: 8 },
});
