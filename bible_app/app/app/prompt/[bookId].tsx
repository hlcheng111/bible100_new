import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { generatePrompt, t } from '@bible-app/core';
import { useSettings } from '../../src/contexts/SettingsContext';
import { themeForPersona } from '../../src/theme/personaTheme';

export default function PromptScreen() {
  const { bookId, chapter } = useLocalSearchParams<{ bookId: string; chapter?: string }>();
  const { locale, persona } = useSettings();
  const theme = themeForPersona(persona);

  const prompt = useMemo(
    () =>
      generatePrompt({
        bookId: parseInt(bookId ?? '1', 10),
        chapter: chapter ? parseInt(chapter, 10) : undefined,
        persona,
        locale,
        outputType: 'notebooklm',
      }),
    [bookId, chapter, persona, locale]
  );

  const copy = async () => {
    await Clipboard.setStringAsync(prompt);
    Alert.alert('已複製', '請貼到 NotebookLM 或其他 AI 平台，並由牧者審核。');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.hint, { color: theme.muted }]}>
        AI 草稿 · 需牧者審核 · 不取代聖經權威
      </Text>
      <Text style={[styles.prompt, { color: theme.text }]}>{prompt}</Text>
      <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={copy}>
        <Text style={styles.btnText}>{t('copyPrompt', locale)}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  hint: { marginBottom: 12, fontSize: 13 },
  prompt: { lineHeight: 22, marginBottom: 24 },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
