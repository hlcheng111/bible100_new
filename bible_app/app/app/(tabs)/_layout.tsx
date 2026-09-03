import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { kidsUi } from '../../src/theme/kidsUiTheme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: kidsUi.bg },
        headerTitleStyle: { fontWeight: '800', color: kidsUi.text },
        tabBarActiveTintColor: kidsUi.tabActive,
        tabBarInactiveTintColor: kidsUi.tabInactive,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 3,
          borderTopColor: '#FFE66D',
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '今日',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '地圖',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: '同跑隊',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏃" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prizes"
        options={{
          title: '獎品',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '更多',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
