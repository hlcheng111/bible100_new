import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { getThematicTheme } from '@bible-app/core';
import { kidsUi } from '../../../src/theme/kidsUiTheme';

export default function ThematicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = id ? getThematicTheme(id) : undefined;

  if (!theme) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: theme.nameZh }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
        <Text style={styles.emoji}>{theme.emoji}</Text>
        <Text style={styles.lead}>依序閱讀以下篇章</Text>
        {theme.units.map((u, i) => (
          <Pressable
            key={`${u.bookId}-${u.chapter}`}
            style={[styles.row, { borderColor: theme.color }]}
            onPress={() =>
              router.push({
                pathname: '/bible/read',
                params: { bookId: String(u.bookId), chapter: String(u.chapter) },
              })
            }
          >
            <Text style={styles.idx}>{i + 1}</Text>
            <Text style={styles.label}>{u.labelZh}</Text>
            <Text style={styles.go}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  lead: { fontSize: 15, color: kidsUi.textLight, marginBottom: 16, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 3,
  },
  idx: { width: 28, fontWeight: '900', color: kidsUi.textLight, fontSize: 16 },
  label: { flex: 1, fontSize: 17, fontWeight: '700', color: kidsUi.text },
  go: { fontSize: 22, color: '#CBD5E1' },
});
