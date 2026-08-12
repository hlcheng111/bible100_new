import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { getBibleBooks } from '@bible-app/core';
import { kidsUi } from '../../src/theme/kidsUiTheme';

export default function BibleBooksScreen() {
  const books = useMemo(() => getBibleBooks(), []);
  const [filter, setFilter] = useState<'all' | 'OT' | 'NT'>('all');
  const [q, setQ] = useState('');

  const list = books.filter((b) => {
    if (filter !== 'all' && b.testament !== filter) return false;
    if (q && !b.nameZh.includes(q) && !b.nameEn.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '66 卷書目' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
        <Text style={styles.lead}>舊約 39 卷 + 新約 27 卷 · 點書卷 → 選章 → 閱讀</Text>

        <TextInput
          style={styles.search}
          placeholder="搜尋書名…"
          placeholderTextColor="#9CA3AF"
          value={q}
          onChangeText={setQ}
        />

        <View style={styles.tabs}>
          {(['all', 'OT', 'NT'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setFilter(t)}
              style={[styles.tab, filter === t && styles.tabOn]}
            >
              <Text style={[styles.tabText, filter === t && styles.tabTextOn]}>
                {t === 'all' ? '全部' : t === 'OT' ? '舊約' : '新約'}
              </Text>
            </Pressable>
          ))}
        </View>

        {list.map((book) => (
          <Pressable
            key={book.id}
            style={styles.row}
            onPress={() => router.push(`/bible/${book.id}`)}
          >
            <View style={[styles.num, { backgroundColor: book.testament === 'OT' ? '#4ECDC4' : '#818CF8' }]}>
              <Text style={styles.numText}>{book.id}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.name}>{book.nameZh}</Text>
              <Text style={styles.sub}>{book.nameEn} · {book.chapters} 章</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  lead: { fontSize: 15, color: kidsUi.textLight, marginBottom: 12, lineHeight: 22 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  tabOn: { borderColor: kidsUi.tabActive, backgroundColor: '#FFF0F0' },
  tabText: { fontWeight: '700', color: kidsUi.textLight },
  tabTextOn: { color: kidsUi.tabActive },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  num: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  meta: { flex: 1, marginLeft: 12 },
  name: { fontSize: 17, fontWeight: '800', color: kidsUi.text },
  sub: { fontSize: 13, color: kidsUi.textLight, marginTop: 2 },
  arrow: { fontSize: 24, color: '#CBD5E1', fontWeight: '300' },
});
