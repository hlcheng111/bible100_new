import { useLocalSearchParams, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { getBibleBook } from '@bible-app/core';
import { BibleReader } from '../../src/components/BibleReader';
import { kidsUi } from '../../src/theme/kidsUiTheme';

export default function BibleReadScreen() {
  const { bookId: rawB, chapter: rawC } = useLocalSearchParams<{ bookId: string; chapter: string }>();
  const bookId = parseInt(rawB ?? '0', 10);
  const chapter = parseInt(rawC ?? '1', 10);
  const book = getBibleBook(bookId);

  if (!book) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `${book.nameZh} ${chapter} 章`,
          headerStyle: { backgroundColor: kidsUi.bgAlt },
        }}
      />
      <View style={styles.wrap}>
        <BibleReader bookId={bookId} chapter={chapter} bookName={book.nameZh} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: kidsUi.bg },
});
