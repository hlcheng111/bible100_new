import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';
import { getThirtyDayPlan } from '@bible-app/core';
import { kidsUi } from '../../src/theme/kidsUiTheme';

export default function ThirtyDayScreen() {
  const days = getThirtyDayPlan();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '30 日讀經' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
        <Text style={styles.lead}>每天一章精選 · 30 天走一遍信仰核心經文</Text>
        {days.map((d) => (
          <Pressable
            key={d.day}
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: '/bible/read',
                params: { bookId: String(d.bookId), chapter: String(d.chapter) },
              })
            }
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>D{d.day}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.title}>{d.titleZh}</Text>
              <Text style={styles.hint}>{d.hintZh}</Text>
            </View>
            <Text style={styles.go}>📖</Text>
          </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  meta: { flex: 1, marginLeft: 12 },
  title: { fontSize: 17, fontWeight: '800', color: kidsUi.text },
  hint: { fontSize: 13, color: kidsUi.textLight, marginTop: 4 },
  go: { fontSize: 24 },
});
