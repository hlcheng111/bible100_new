import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { ProgressProvider } from '../src/contexts/ProgressContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ProgressProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="hub/pick-persona" options={{ headerShown: true, title: '選對象' }} />
            <Stack.Screen name="hub/pick-mode" options={{ headerShown: true, title: '選讀經方式' }} />
            <Stack.Screen name="pick-runner" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="bible/index" options={{ headerShown: true, title: '66 卷書目' }} />
            <Stack.Screen name="bible/[bookId]" />
            <Stack.Screen name="bible/read" />
            <Stack.Screen name="modes/thirty-day" />
            <Stack.Screen name="modes/golden-verses" />
            <Stack.Screen name="modes/thematic/index" />
            <Stack.Screen name="modes/thematic/[id]" />
            <Stack.Screen name="unit/[unitId]" options={{ headerShown: true, title: '故事' }} />
            <Stack.Screen name="unit/game" options={{ headerShown: true, title: '小遊戲' }} />
            <Stack.Screen name="settings" options={{ headerShown: true, title: '設定' }} />
          </Stack>
        </ProgressProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
