import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import hi from "./translations/hi.json";
import kn from "./translations/kn.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
];
