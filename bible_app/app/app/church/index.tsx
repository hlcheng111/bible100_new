import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { aggregateMemberProgress, t } from '@bible-app/core';
import { getFirestoreDb } from '../../src/firebase/client';
import { useSettings } from '../../src/contexts/SettingsContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { themeForPersona } from '../../src/theme/personaTheme';

interface MemberRow {
  userId: string;
  displayName: string;
  role: string;
  percent: number;
}

export default function ChurchDashboardScreen() {
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [churchName, setChurchName] = useState('示範教會');

  useEffect(() => {
    const db = getFirestoreDb();
    if (!db) {
      setMembers([
        { userId: 'demo1', displayName: '弟兄 A', role: 'member', percent: 12 },
        { userId: 'demo2', displayName: '姊妹 B', role: 'member', percent: 34 },
      ]);
      return;
    }
    (async () => {
      const churchId = 'demo_church';
      const memSnap = await getDocs(collection(db, 'churches', churchId, 'members'));
      const raw = memSnap.docs.map((d) => ({
        userId: d.id,
        displayName: (d.data().displayName as string) || d.id,
        role: (d.data().role as 'member') || 'member',
      }));
      const progressByUser: Record<string, { completed: number; total: number }> = {};
      for (const m of raw) {
        const pSnap = await getDocs(
          query(
            collection(db, 'users', m.userId, 'progress'),
            where('status', '==', 'completed')
          )
        );
        progressByUser[m.userId] = { completed: pSnap.size, total: 1189 };
      }
      const agg = aggregateMemberProgress(raw, progressByUser);
      setMembers(agg);
      const churchDoc = await getDocs(collection(db, 'churches'));
      churchDoc.forEach((c) => {
        if (c.id === churchId) setChurchName((c.data().name as string) || churchId);
      });
    })();
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{churchName}</Text>
      <Text style={{ color: theme.muted, marginBottom: 12 }}>{t('churchDashboard', locale)}</Text>

      <Pressable onPress={() => router.push('/church/sync-reading')}>
        <Text style={[styles.link, { color: theme.accent }]}>{t('syncReading', locale)} →</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/church/qna')}>
        <Text style={[styles.link, { color: theme.accent }]}>{t('qna', locale)} →</Text>
      </Pressable>

      <Text style={[styles.section, { color: theme.text }]}>會員進度</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, flex: 1 }}>{item.displayName}</Text>
            <Text style={{ color: theme.accent }}>{item.percent}%</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  link: { fontSize: 16, marginVertical: 8 },
  section: { marginTop: 16, marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', padding: 12, marginBottom: 6, borderRadius: 10 },
});
