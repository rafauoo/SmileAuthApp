import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { languageNames } from "@/src/localization/localizationNames";

export default function Settings() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<string>(i18n.language);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  function handleSwipe(event: PanGestureHandlerGestureEvent) {
    if (event.nativeEvent.translationX > 100 && !isNavigating) {
      setIsNavigating(true);
      router.push("/main");
    }
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={handleSwipe}
        testID="PanGestureHandler"
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t("screens.settings.title")}</Text>
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>
              {t("screens.settings.lang")}
            </Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
              >
                <Text style={styles.dropdownButtonText}>
                  {languageNames[currentLang]}
                </Text>
                <MaterialIcons
                  name={
                    dropdownVisible
                      ? "keyboard-arrow-up"
                      : "keyboard-arrow-down"
                  }
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {dropdownVisible && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    testID="change-english"
                    onPress={() => changeLanguage("en")}
                  >
                    <Text style={styles.dropdownItemText}>English</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => changeLanguage("pl")}
                  >
                    <Text style={styles.dropdownItemText}>Polski</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
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
  optionsTitle: {
    fontSize: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
    textAlign: "center",
  },
  optionsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FF8940",
  },
  dropdownButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#FF8940",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    width: 180,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dropdownItemText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
});
