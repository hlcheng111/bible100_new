import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackingEngine, t } from '@bible-app/core';
import { useSettings } from '../../src/contexts/SettingsContext';
import { themeForPersona } from '../../src/theme/personaTheme';

interface ChildProgress {
  childId: string;
  name: string;
  percent: number;
}

const CHILDREN_KEY = 'bible_app_linked_children';

export default function ParentViewScreen() {
  const { locale } = useSettings();
  const theme = themeForPersona('adult');
  const [children, setChildren] = useState<ChildProgress[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(CHILDREN_KEY);
      const linked: { childId: string; name: string }[] = raw
        ? JSON.parse(raw)
        : [{ childId: 'child_demo_1', name: '小明' }];

      const engine = new TrackingEngine(
        {
          get: async (k) => {
            const v = await AsyncStorage.getItem(k);
            return v ? JSON.parse(v) : null;
          },
          set: async (k, v) => AsyncStorage.setItem(k, JSON.stringify(v)),
          getAll: async (prefix) => {
            const keys = await AsyncStorage.getAllKeys();
            const out = [];
            for (const k of keys.filter((x) => x.startsWith(prefix))) {
              const v = await AsyncStorage.getItem(k);
              if (v) out.push(JSON.parse(v));
            }
            return out;
          },
        },
        { userId: linked[0]?.childId || 'child_demo_1' }
      );

      const list: ChildProgress[] = [];
      for (const c of linked) {
        const eng = new TrackingEngine(
          {
            get: async (k) => {
              const v = await AsyncStorage.getItem(k.replace(/progress:[^:]+:/, `progress:${c.childId}:`));
              return v ? JSON.parse(v) : null;
            },
            set: async () => {},
            getAll: async () => [],
          },
          { userId: c.childId }
        );
        const nt = await eng.getTrackSummary('nt');
        list.push({ childId: c.childId, name: c.name, percent: nt.percent });
      }
      setChildren(list.length ? list : [{ childId: 'demo', name: '小明', percent: 5 }]);
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('parentView', locale)}</Text>
      <Text style={{ color: theme.muted, marginBottom: 16 }}>
        {locale === 'zh-Hant' ? '查看連結子女讀經進度（COPPA：需家長同意）' : 'Linked children progress'}
      </Text>
      <FlatList
        data={children}
        keyExtractor={(item) => item.childId}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, fontSize: 18 }}>{item.name}</Text>
            <Text style={{ color: theme.accent }}>{item.percent}% NT</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  card: { padding: 16, borderRadius: 12, marginBottom: 8 },
});
