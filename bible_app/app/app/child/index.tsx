import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { TrackingEngine, t } from '@bible-app/core';
import { useSettings } from '../../src/contexts/SettingsContext';
import { themeForPersona } from '../../src/theme/personaTheme';

/** Child persona landing — Lottie placeholder via Animated bounce (swap for lottie-react-native in prod). */
export default function ChildModeScreen() {
  const { locale, setPersona } = useSettings();
  const theme = themeForPersona('child');
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPersona('child');
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -12, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [bounce, setPersona]);

  const track = TrackingEngine.getTrack('nt');
  const first = track?.units[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.Text
        style={[styles.mascot, { transform: [{ translateY: bounce }] }]}
      >
        🦁
      </Animated.Text>
      <Text style={[styles.title, { color: theme.primary, fontSize: theme.headingSize }]}>
        {t('childMode', locale)}
      </Text>
      <Text style={[styles.sub, { color: theme.muted, fontSize: theme.bodySize }]}>
        {locale === 'zh-Hant' ? '和獅子一起讀聖經故事！' : 'Read Bible stories with Leo!'}
      </Text>
      {first && (
        <Pressable
          style={[styles.btn, { backgroundColor: theme.accent, borderRadius: theme.borderRadius }]}
          onPress={() => router.push(`/read/${first.unitId}`)}
        >
          <Text style={styles.btnText}>
            {locale === 'zh-Hant' ? '開始讀' : 'Start'} — {first.bookNameZh} {first.chapter}
          </Text>
        </Pressable>
      )}
      <Pressable onPress={() => router.push('/parent')}>
        <Text style={{ color: theme.primary, marginTop: 24 }}>{t('parentView', locale)} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  mascot: { fontSize: 80, marginBottom: 16 },
  title: { fontWeight: '800', marginBottom: 8 },
  sub: { textAlign: 'center', marginBottom: 24 },
  btn: { paddingHorizontal: 24, paddingVertical: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
