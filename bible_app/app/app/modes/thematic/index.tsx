import { ScrollView, Text, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { getThematicThemes } from '@bible-app/core';
import { HubCard } from '../../../src/components/hub/HubCard';
import { kidsUi } from '../../../src/theme/kidsUiTheme';

export default function ThematicIndexScreen() {
  const themes = getThematicThemes();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '主題讀經' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pad}>
        <Text style={styles.lead}>按主題串連經文 · 適合小組或個人靈修</Text>
        {themes.map((t) => (
          <HubCard
            key={t.id}
            emoji={t.emoji}
            title={t.nameZh}
            desc={`${t.units.length} 個篇章`}
            color={t.color}
            onPress={() => router.push(`/modes/thematic/${t.id}`)}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: kidsUi.bg },
  pad: { padding: 16, paddingBottom: 40 },
  lead: { fontSize: 15, color: kidsUi.textLight, marginBottom: 16, lineHeight: 22 },
});
