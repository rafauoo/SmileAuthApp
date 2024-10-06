import React from "react";
import { View, Text } from "react-native";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter, useFocusEffect } from "expo-router";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";

export default function MenuScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false);


  function handleSwipeRight(event: PanGestureHandlerGestureEvent) {
    console.log(event.nativeEvent.translationX)
    if (event.nativeEvent.translationX < -100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/main");
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
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
