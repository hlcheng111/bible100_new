import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { getUnit } from '@bible-app/core';
import { markUnitComplete, addSticker } from '../../src/storage/kidsProgress';
import { BubbleButton } from '../../src/components/kids/BubbleButton';

export default function UnitGameScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const unit = unitId ? getUnit(unitId) : undefined;
  const [picked, setPicked] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [celebrate] = useState(() => new Animated.Value(1));

  if (!unit) {
    return (
      <View style={styles.centered}>
        <Text>找不到遊戲</Text>
      </View>
    );
  }

  const g = unit.game;
  const c = unit.colors;
  const correct = picked === g.answerIndex;

  const onPick = async (idx: number) => {
    setPicked(idx);
    if (idx === g.answerIndex) {
      setWon(true);
      await markUnitComplete(unit.unitId);
      await addSticker(unit.sticker.id);
      Animated.sequence([
        Animated.timing(celebrate, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(celebrate, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: '🎮 小遊戲', headerStyle: { backgroundColor: c.secondary } }} />
      <View style={[styles.container, { backgroundColor: c.secondary }]}>
        <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: celebrate }] }]}>
          {won ? '🎉' : unit.heroEmoji}
        </Animated.Text>

        {!won ? (
          <>
            <Text style={styles.question}>{g.questionZh}</Text>
            {g.optionsZh.map((opt, idx) => (
              <Pressable
                key={opt}
                style={[
                  styles.option,
                  picked === idx && (idx === g.answerIndex ? styles.optionOk : styles.optionBad),
                ]}
                onPress={() => picked === null && onPick(idx)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
            {picked !== null && !correct && (
              <Pressable onPress={() => setPicked(null)}>
                <Text style={styles.retry}>沒關係，再試一次！👆 點這裡</Text>
              </Pressable>
            )}
          </>
        ) : (
          <View style={styles.winBox}>
            <Text style={styles.winTitle}>太棒了！</Text>
            <Text style={styles.winSticker}>
              你得到了 {unit.sticker.emoji} {unit.sticker.nameZh}
            </Text>
            <Text style={styles.puzzle}>拼字：{g.wordPuzzleZh}</Text>
            <BubbleButton
              label="回今日首頁"
              color={c.primary}
              onPress={() => router.replace('/(tabs)/home')}
              style={{ width: '100%', marginTop: 20 }}
            />
            <BubbleButton
              label="看獎品牆"
              color={c.accent}
              onPress={() => router.replace('/(tabs)/prizes')}
              style={{ width: '100%', marginTop: 12 }}
            />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bigEmoji: { fontSize: 88, marginBottom: 20 },
  question: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D1B4E',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  option: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  optionOk: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  optionBad: { borderColor: '#F87171', backgroundColor: '#FEE2E2' },
  optionText: { fontSize: 17, fontWeight: '700', color: '#2D1B4E', textAlign: 'center' },
  retry: { marginTop: 16, color: '#5C4D7A', fontSize: 15 },
  winBox: { width: '100%', alignItems: 'center' },
  winTitle: { fontSize: 32, fontWeight: '900', color: '#2D1B4E' },
  winSticker: { fontSize: 20, marginTop: 12, fontWeight: '700', color: '#7C3AED' },
  puzzle: { marginTop: 16, fontSize: 24, fontWeight: '900', letterSpacing: 8, color: '#FF6B6B' },
});
