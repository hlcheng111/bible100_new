import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Alert } from 'react-native';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { TrackingEngine, buildGroupSession, t } from '@bible-app/core';
import { getFirestoreDb } from '../../src/firebase/client';
import { useAuth } from '../../src/contexts/AuthContext';
import { useSettings } from '../../src/contexts/SettingsContext';
import { themeForPersona } from '../../src/theme/personaTheme';

export default function SyncReadingScreen() {
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);
  const { userId } = useAuth();
  const [groupId, setGroupId] = useState('group_youth_01');
  const [sessions, setSessions] = useState<ReturnType<typeof buildGroupSession>[]>([]);

  const createSession = async () => {
    const track = TrackingEngine.getTrack('nt');
    const unit = track?.units[0];
    if (!unit) return;
    const today = new Date().toISOString().slice(0, 10);
    const session = buildGroupSession('demo_church', groupId, 'nt', unit.unitId, today, '本週共讀');
    const db = getFirestoreDb();
    if (db) {
      await setDoc(doc(db, 'groupSessions', session.sessionId), {
        ...session,
        createdAt: serverTimestamp(),
      });
      if (userId) {
        await setDoc(doc(db, 'groupSessions', session.sessionId, 'participants', userId), {
          completed: false,
          joinedAt: serverTimestamp(),
        });
      }
    }
    setSessions((s) => [session, ...s]);
    Alert.alert('已建立', `共讀單元：${unit.bookNameZh} ${unit.chapter}`);
  };

  const markJoined = async (sessionId: string) => {
    const db = getFirestoreDb();
    if (db && userId) {
      await setDoc(
        doc(db, 'groupSessions', sessionId, 'participants', userId),
        { completed: true, completedAt: new Date().toISOString() },
        { merge: true }
      );
    }
    Alert.alert('已標記', '本週共讀完成');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('syncReading', locale)}</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border }]}
        value={groupId}
        onChangeText={setGroupId}
        placeholder="小組 ID"
      />
      <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={createSession}>
        <Text style={styles.btnText}>建立本週共讀</Text>
      </Pressable>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.sessionId}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text }}>{item.scheduledDate}</Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{item.unitId}</Text>
            <Pressable onPress={() => markJoined(item.sessionId)}>
              <Text style={{ color: theme.accent, marginTop: 8 }}>標記我已完成</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { padding: 14, borderRadius: 10, marginBottom: 8 },
});
