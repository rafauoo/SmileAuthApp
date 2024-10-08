import { Stack } from "expo-router";
import React from 'react';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="score"
        options={{
          presentation: "card", // Można zostawić 'fullScreenModal' jeśli to potrzebne
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal", // Ustawiamy gest w poziomie
          animation: "slide_from_right"
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          presentation: "card", // Obsługa typu "card" dla animacji
          headerShown: false,
          animation: "slide_from_left", // Animacja przesuwania z lewej strony
          gestureEnabled: true, // Włączenie obsługi gestów
          gestureDirection: "horizontal", // Ustawiamy gest w poziomie
        }}
      />
      <Stack.Screen
        name="main"
        options={{
          presentation: "card", // Można zostawić 'fullScreenModal' jeśli to potrzebne
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal", // Ustawiamy gest w poziomie
          animation: "slide_from_right"
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "card", // Można zostawić 'fullScreenModal' jeśli to potrzebne
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal", // Ustawiamy gest w poziomie
          animation: "slide_from_right"
        }}
      />
    </Stack>
  );
}
