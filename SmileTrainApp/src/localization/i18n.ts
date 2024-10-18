import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { pl, en } from "./translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_LANGUAGE_KEY = "settings.lang";

const languageDetectorPlugin: any = {
  type: "languageDetector",
  async: true,
  init: () => {},
  detect: async function (callback: (lang: string) => void) {
    try {
      await AsyncStorage.getItem(STORAGE_LANGUAGE_KEY).then((language) => {
        if (language) {
          return callback(language);
        } else {
          return callback("pl");
        }
      });
    } catch (error) {
      console.log("Error reading language from storage.", error);
    }
  },
  cacheUserLanguage: async function (language: string) {
    try {
      await AsyncStorage.setItem(STORAGE_LANGUAGE_KEY, language);
    } catch (error) {}
  },
};

const resources = {
  pl: {
    translation: pl,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources,
    compatibilityJSON: "v3",
    fallbackLng: "pl",
    interpolation: {
      escapeValue: false,
    },
  });

export { i18n, languageDetectorPlugin, STORAGE_LANGUAGE_KEY };
