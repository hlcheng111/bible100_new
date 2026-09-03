import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getStickers } from '../../src/storage/kidsProgress';
import { getAllUnits } from '@bible-app/core';
import { kidsUi } from '../../src/theme/kidsUiTheme';

export default function PrizesTab() {
  const [earned, setEarned] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getStickers().then(setEarned);
    }, [])
  );

  const all = getAllUnits();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>🏅 我的獎品牆</Text>
      <Text style={styles.sub}>每讀完一關，就會得到一張貼紙！</Text>

      <View style={styles.grid}>
        {all.map((unit) => {
          const has = earned.includes(unit.sticker.id);
          return (
            <View
              key={unit.sticker.id}
              style={[
                styles.sticker,
                { backgroundColor: has ? unit.colors.secondary : '#E5E7EB' },
                has && { borderColor: unit.colors.primary },
              ]}
            >
              <Text style={[styles.stickerEmoji, !has && styles.locked]}>
                {has ? unit.sticker.emoji : '❓'}
              </Text>
              <Text style={styles.stickerName} numberOfLines={2}>
                {has ? unit.sticker.nameZh : '還沒解鎖'}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.count}>
        已收集 {earned.length} / {all.length} 張貼紙
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#2D1B4E' },
  sub: { fontSize: 15, color: '#5C4D7A', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sticker: {
    width: '30%',
    minWidth: 100,
    aspectRatio: 0.85,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  stickerEmoji: { fontSize: 40 },
  locked: { opacity: 0.35 },
  stickerName: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6, color: '#2D1B4E' },
  count: { marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#5C4D7A' },
});
