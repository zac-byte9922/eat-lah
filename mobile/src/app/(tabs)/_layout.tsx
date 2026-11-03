import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../components/ui';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#FFF', borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      {(
        [
          ['index', '首页', '⌂'],
          ['shopping', '买菜', '▤'],
          ['pantry', '厨房', '▧'],
          ['history', '记录', '✓'],
          ['profile', '我的', '◎'],
        ] as const
      ).map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 23, color }}>{icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
