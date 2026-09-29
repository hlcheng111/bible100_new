import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { t } from '@bible-app/core';
import type { Locale, Persona } from '@bible-app/core';
import { useSettings } from '../src/contexts/SettingsContext';
import { useAuth } from '../src/contexts/AuthContext';
import { themeForPersona } from '../src/theme/personaTheme';

const LOCALES: Locale[] = ['zh-Hant', 'en', 'vi', 'id'];
const PERSONAS: Persona[] = ['kids', 'youth', 'child', 'adult', 'seeker', 'parent'];

export default function SettingsScreen() {
  const {
    locale,
    persona,
    bilingual,
    remindersEnabled,
    setLocale,
    setPersona,
    toggleBilingual,
    setRemindersEnabled,
  } = useSettings();
  const { signOut } = useAuth();
  const theme = themeForPersona(persona);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.muted }]}>語言</Text>
      <View style={styles.row}>
        {LOCALES.map((l) => (
          <Pressable
            key={l}
            style={[styles.chip, locale === l && { backgroundColor: theme.primary }]}
            onPress={() => setLocale(l)}
          >
            <Text style={{ color: locale === l ? '#fff' : theme.text }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.muted }]}>對象 Persona</Text>
      <View style={styles.row}>
        {PERSONAS.map((p) => (
          <Pressable
            key={p}
            style={[styles.chip, persona === p && { backgroundColor: theme.accent }]}
            onPress={() => setPersona(p)}
          >
            <Text style={{ color: persona === p ? '#fff' : theme.text }}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={{ color: theme.text }}>{t('bilingual', locale)}</Text>
        <Switch value={bilingual} onValueChange={toggleBilingual} />
      </View>

      <View style={styles.switchRow}>
        <Text style={{ color: theme.text }}>每日提醒</Text>
        <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} />
      </View>

      <Pressable style={[styles.btn, { borderColor: theme.primary }]} onPress={() => signOut()}>
        <Text style={{ color: theme.primary }}>{t('signOut', locale)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 16, marginBottom: 8, fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  btn: { marginTop: 32, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
});
