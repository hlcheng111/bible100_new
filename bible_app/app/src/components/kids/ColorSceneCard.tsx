import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { StoryUnit } from '@bible-app/core';

interface Props {
  unit: StoryUnit;
  locale: 'zh' | 'en';
  completed?: boolean;
  onPress: () => void;
  locked?: boolean;
}

export function ColorSceneCard({ unit, locale, completed, onPress, locked }: Props) {
  const title = locale === 'zh' ? unit.titleZh : unit.titleEn;
  const c = unit.colors;
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={[
        styles.card,
        {
          backgroundColor: c.secondary,
          borderColor: c.primary,
          opacity: locked ? 0.45 : 1,
        },
      ]}
    >
      <View style={[styles.hero, { backgroundColor: c.primary }]}>
        <Text style={styles.heroEmoji}>{unit.heroEmoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.order}>#{unit.order}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {unit.minutes} min · {unit.bookLabelZh} {unit.chapter}
          {completed ? ' · ✓' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 3,
    marginBottom: 12,
    overflow: 'hidden',
    minHeight: 100,
  },
  hero: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 44 },
  body: { flex: 1, padding: 14, justifyContent: 'center' },
  order: { fontSize: 12, fontWeight: '700', color: '#5C4D7A', marginBottom: 2 },
  title: { fontSize: 18, fontWeight: '800', color: '#2D1B4E' },
  meta: { fontSize: 13, color: '#5C4D7A', marginTop: 4 },
});
