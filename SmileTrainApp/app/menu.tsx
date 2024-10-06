import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter, useFocusEffect } from "expo-router";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import EvaluationList from "@/src/components/EvaluationList";

export default function MenuScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false);

  function handleSwipeRight(event: PanGestureHandlerGestureEvent) {
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
        <View style={styles.container}>
            <Text style={styles.title}>Historia Ewaluacji</Text>
            <EvaluationList/>
        </View>
        </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#F5F5F5',
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 30,
  },
  item: {
      padding: 10,
      marginVertical: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
  },
});
