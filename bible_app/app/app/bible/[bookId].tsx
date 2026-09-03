import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { getBibleBook, getChapterList } from '@bible-app/core';
import { kidsUi } from '../../src/theme/kidsUiTheme';

export default function BibleChaptersScreen() {
  const { bookId: raw } = useLocalSearchParams<{ bookId: string }>();
  const bookId = parseInt(raw ?? '0', 10);
  const book = getBibleBook(bookId);
  const chapters = getChapterList(bookId);

  if (!book) {
    return (
      <View style={styles.centered}>
        <Text>找不到書卷</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: book.nameZh }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
        <Text style={styles.lead}>
          {book.nameEn} · 共 {book.chapters} 章
        </Text>
        <View style={styles.grid}>
          {chapters.map((ch) => (
            <Pressable
              key={ch}
              style={styles.cell}
              onPress={() =>
                router.push({ pathname: '/bible/read', params: { bookId: String(bookId), chapter: String(ch) } })
              }
            >
              <Text style={styles.cellText}>{ch}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lead: { fontSize: 15, color: kidsUi.textLight, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '18%',
    minWidth: 56,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFE66D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 18, fontWeight: '800', color: kidsUi.text },
});
