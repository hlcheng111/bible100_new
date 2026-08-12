import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useKidsRunner } from '../../src/hooks/useKidsRunner';
import { ColorSceneCard } from '../../src/components/kids/ColorSceneCard';
import { uiForRunner } from '../../src/theme/kidsUiTheme';

export default function MapTab() {
  const { runner, units, completed, refresh, ready } = useKidsRunner();
  const ui = uiForRunner(runner);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: ui.bg }]} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>
        {runner === 'kids' ? '🗺️ 冒險地圖' : '🚀 闖關地圖'}
      </Text>
      <Text style={styles.sub}>一關一關往前跑，彩色關卡等你解鎖！</Text>

      {ready &&
        units.map((unit, idx) => {
          const done = completed.includes(unit.unitId);
          const prevDone = idx === 0 || completed.includes(units[idx - 1].unitId);
          return (
            <ColorSceneCard
              key={unit.unitId}
              unit={unit}
              locale="zh"
              completed={done}
              locked={!prevDone && !done}
              onPress={() => router.push(`/unit/${unit.unitId}`)}
            />
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#2D1B4E' },
  sub: { fontSize: 15, color: '#5C4D7A', marginBottom: 16, marginTop: 4 },
});
