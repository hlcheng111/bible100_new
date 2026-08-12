import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { collection, addDoc, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { newQnaDraft, canAnswerQna, t } from '@bible-app/core';
import type { QnaItem } from '@bible-app/core';
import { getFirestoreDb } from '../../src/firebase/client';
import { useAuth } from '../../src/contexts/AuthContext';
import { useSettings } from '../../src/contexts/SettingsContext';
import { themeForPersona } from '../../src/theme/personaTheme';

const DEMO_CHURCH = 'demo_church';

export default function QnaScreen() {
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);
  const { userId } = useAuth();
  const [items, setItems] = useState<QnaItem[]>([]);
  const [question, setQuestion] = useState('');
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
  const role = 'pastor';

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const db = getFirestoreDb();
    if (!db) {
      setItems([
        {
          qnaId: '1',
          churchId: DEMO_CHURCH,
          question: '創世記第一章「日是怎樣」？',
          answer: '請參考解經資料，第一日神造光…',
          askedBy: 'user1',
          answeredBy: 'pastor1',
          locale: 'zh-Hant',
          visibility: 'church',
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    const snap = await getDocs(
      query(collection(db, 'churches', DEMO_CHURCH, 'qna'), orderBy('createdAt', 'desc'))
    );
    setItems(
      snap.docs.map((d) => ({ qnaId: d.id, ...d.data() } as QnaItem))
    );
  };

  const submitQuestion = async () => {
    if (!question.trim() || !userId) return;
    const draft = newQnaDraft(DEMO_CHURCH, userId, question.trim(), locale);
    const db = getFirestoreDb();
    if (db) {
      await addDoc(collection(db, 'churches', DEMO_CHURCH, 'qna'), draft);
    } else {
      setItems((prev) => [
        { qnaId: String(Date.now()), ...draft } as QnaItem,
        ...prev,
      ]);
    }
    setQuestion('');
    load();
  };

  const submitAnswer = async (qnaId: string) => {
    const text = answerDraft[qnaId];
    if (!text?.trim()) return;
    const db = getFirestoreDb();
    if (db) {
      await updateDoc(doc(db, 'churches', DEMO_CHURCH, 'qna', qnaId), {
        answer: text,
        answeredBy: userId,
      });
    }
    load();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('qna', locale)}</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border }]}
        placeholder="輸入讀經問題…"
        value={question}
        onChangeText={setQuestion}
        multiline
      />
      <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={submitQuestion}>
        <Text style={styles.btnText}>提交問題</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(item) => item.qnaId}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Q: {item.question}</Text>
            {item.answer ? (
              <Text style={{ color: theme.muted, marginTop: 8 }}>A: {item.answer}</Text>
            ) : canAnswerQna(role) ? (
              <View style={{ marginTop: 8 }}>
                <TextInput
                  style={[styles.input, { borderColor: theme.border }]}
                  placeholder="牧者回答（需神學審核）"
                  value={answerDraft[item.qnaId] || ''}
                  onChangeText={(v) => setAnswerDraft((d) => ({ ...d, [item.qnaId]: v }))}
                />
                <Pressable onPress={() => submitAnswer(item.qnaId)}>
                  <Text style={{ color: theme.accent }}>發布回答</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={{ color: theme.muted, marginTop: 8 }}>等待牧者回答</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: '#fff' },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { padding: 14, borderRadius: 10, marginBottom: 8 },
});
