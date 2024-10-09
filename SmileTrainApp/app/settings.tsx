import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
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
          <TouchableOpacity onPress={() => i18n.changeLanguage("pl")}>
            <Text>Polski</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => i18n.changeLanguage("en")}>
            <Text>English</Text>
          </TouchableOpacity>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
    textAlign: "center",
  },
});
