import { Stack } from "expo-router";

export default function StatusLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="status" />
      <Stack.Screen name="view-status" />
      <Stack.Screen name="personal-status" />
      <Stack.Screen name="create-status" />
    </Stack>
  );
}
