import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import type { Verse } from '@bible-app/core';
import { useSettings } from '../contexts/SettingsContext';
import { getBibleService } from '../bible/SqliteBibleService';
import { themeForPersona } from '../theme/personaTheme';

interface BibleReaderProps {
  bookId: number;
  chapter: number;
  bookName: string;
}

export function BibleReader({ bookId, chapter, bookName }: BibleReaderProps) {
  const { locale, bilingual, persona } = useSettings();
  const theme = themeForPersona(persona);
  const [primary, setPrimary] = useState<Verse[]>([]);
  const [secondary, setSecondary] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const svc = await getBibleService();
      const result = await svc.getChapter(bookId, chapter);
      if (cancelled) return;
      setPrimary(result.primary);
      setSecondary(result.secondary);
      setEmpty(result.primary.length === 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, chapter]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.muted }]}>
          {locale === 'zh-Hant'
            ? `本章經文尚未下載。請執行 build:bible 匯入完整譯本，或先閱讀樣本章節（創 1–3、約 1）。`
            : 'Chapter not in offline pack. Run build:bible or read sample chapters (Gen 1–3, John 1).'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: theme.primary, fontSize: theme.headingSize }]}>
        {bookName} {chapter}
      </Text>
      {primary.map((verse) => (
        <View key={`p-${verse.v}`} style={styles.verseRow}>
          <Text style={[styles.verseNum, { color: theme.accent }]}>{verse.v}</Text>
          <Text style={[styles.verseText, { fontSize: theme.bodySize, color: theme.text }]}>
            {verse.t}
          </Text>
        </View>
      ))}
      {bilingual && secondary.length > 0 && (
        <View style={[styles.secondaryBlock, { borderColor: theme.border }]}>
          <Text style={[styles.secondaryLabel, { color: theme.muted }]}>EN</Text>
          {secondary.map((verse) => (
            <View key={`s-${verse.v}`} style={styles.verseRow}>
              <Text style={[styles.verseNum, { color: theme.accent }]}>{verse.v}</Text>
              <Text style={[styles.verseText, { fontSize: theme.bodySize - 1, color: theme.muted }]}>
                {verse.t}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontWeight: '700', marginBottom: 16 },
  verseRow: { flexDirection: 'row', marginBottom: 10, gap: 8 },
  verseNum: { width: 28, fontWeight: '600', fontSize: 14 },
  verseText: { flex: 1, lineHeight: 24 },
  secondaryBlock: { marginTop: 24, paddingTop: 16, borderTopWidth: 1 },
  secondaryLabel: { fontSize: 12, marginBottom: 8, fontWeight: '600' },
  empty: { padding: 24 },
  emptyText: { lineHeight: 22, textAlign: 'center' },
});
