import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { kidsUi } from '../../theme/kidsUiTheme';

interface Props {
  emoji: string;
  title: string;
  desc: string;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export function HubCard({ emoji, title, desc, color, onPress, style, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        { borderColor: color, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      <Text style={[styles.emoji, compact && styles.emojiSm]}>{emoji}</Text>
      <Text style={[styles.title, compact && styles.titleSm]}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 4,
    padding: 22,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: kidsUi.text,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  compact: { padding: 16, borderRadius: 20, borderWidth: 3 },
  emoji: { fontSize: 56, marginBottom: 8 },
  emojiSm: { fontSize: 40, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '900', color: kidsUi.text, textAlign: 'center' },
  titleSm: { fontSize: 18 },
  desc: { fontSize: 15, color: kidsUi.textLight, textAlign: 'center', marginTop: 6, lineHeight: 22 },
});
