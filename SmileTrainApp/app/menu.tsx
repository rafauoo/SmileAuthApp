import * as React from "react";
import { View, Text } from "react-native";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter, useFocusEffect } from "expo-router";
import Animated from "react-native-reanimated";

export default function MenuScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false); // Kontrola nawigacji

  // Obsługa gestu przesunięcia w prawo, aby przejść do ekranu głównego
  function handleSwipeRight(event) {
    console.log(event.nativeEvent.translationX)
    if (event.nativeEvent.translationX < -100 && !isNavigating) {
      setIsNavigating(true); // Blokujemy ponowną nawigację
      router.push("/main"); // Przechodzimy do ekranu głównego po przesunięciu
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false); // Resetujemy isNavigating, gdy ekran HomeScreen znowu jest w focusie
    }, [])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler onGestureEvent={handleSwipeRight}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24 }}>Menu Screen</Text>
          </View>
        </PanGestureHandler>
    </GestureHandlerRootView>
  );
}
