import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { KitchenProvider, useKitchen } from '../storage/context';
import { Button, colors, Note } from '../components/ui';
function Routes() {
  const { state, error, retry, dismissError } = useKitchen();
  if (!state)
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 30, gap: 16 }}>
        <ActivityIndicator color={colors.green} />
        {error ? (
          <>
            <Note>{error}</Note>
            <Button title="重试读取" onPress={retry} />
          </>
        ) : (
          <Note>正在读取本机厨房…</Note>
        )}
      </View>
    );
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {error ? (
        <View
          accessibilityRole="alert"
          style={{ backgroundColor: '#FFF0E8', padding: 18, paddingTop: 44 }}
        >
          <Note>{error}</Note>
          <Button title="知道了" secondary onPress={dismissError} />
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Protected guard={!state.onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={state.onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="choose" />
          <Stack.Screen name="cook" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <KitchenProvider>
        <Routes />
      </KitchenProvider>
    </SafeAreaProvider>
  );
}
