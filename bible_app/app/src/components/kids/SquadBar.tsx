import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { kidsUi } from '../../theme/kidsUiTheme';

interface Member {
  emoji: string;
  name: string;
  done: boolean;
}

interface Props {
  members: Member[];
  percent: number;
  label?: string;
}

export function SquadBar({ members, percent, label = '同跑隊 · 你跑我追' }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.avatars}>
        {members.map((m, i) => (
          <View
            key={m.name}
            style={[
              styles.avatar,
              { backgroundColor: kidsUi.squadColors[i % kidsUi.squadColors.length] },
              m.done && styles.avatarDone,
            ]}
          >
            <Text style={styles.avatarEmoji}>{m.emoji}</Text>
          </View>
        ))}
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.percent}>{percent}% 今天一起跑完了！</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 3,
    borderColor: '#FFE66D',
  },
  label: { fontSize: 16, fontWeight: '800', color: '#2D1B4E', marginBottom: 10 },
  avatars: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarDone: { borderColor: '#22C55E', borderWidth: 3 },
  avatarEmoji: { fontSize: 24 },
  barBg: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#4ECDC4', borderRadius: 7 },
  percent: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#5C4D7A' },
});
