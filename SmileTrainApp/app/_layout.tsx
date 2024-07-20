import { Slot } from "expo-router";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="menu"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          animationTypeForReplace: "pop",
        }}
      />
      <Stack.Screen
        name="main"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
}
