/* istanbul ignore file */
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { useSegments } from "expo-router";
import { useState } from "react";

export default function AppLayout() {
  const segments = useSegments();
  const [currSegment, setCurrSegment] = useState<string | null>(null);
  useEffect(() => {
    setCurrSegment(segments[0]);
  }, [segments]);
  return (
    <Stack>
      <Stack.Screen
        name="score"
        options={{
          presentation: "card",
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          presentation: "card",
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="main"
        options={{
          presentation: "card",
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation:
            currSegment === "settings" ? "slide_from_left" : "slide_from_right",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "card",
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
