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
          <Text style={styles.title}>{t("screens.settings.title")}</Text>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => i18n.changeLanguage("pl")}
          >
            <Text style={styles.buttonText}>Polski</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => i18n.changeLanguage("en")}
          >
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F0F0F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
    textAlign: "center",
  },
  languageButton: {
    backgroundColor: "#6200EE",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
