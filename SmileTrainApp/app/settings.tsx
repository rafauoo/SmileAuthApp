import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Settings() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    function handleSwipe(event: PanGestureHandlerGestureEvent) {
        if (event.nativeEvent.translationX > 100 && !isNavigating) {
          setIsNavigating(true);
          router.push("/main");
        }
      }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleSwipe}>
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
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
      marginBottom: 20,
      textAlign: 'center',
    }
  });
  