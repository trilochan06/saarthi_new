import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import hiCommon from "./locales/hi/common.json";
import taCommon from "./locales/ta/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "hi", "ta"],
    fallbackLng: "en",
    load: "languageOnly",
    nonExplicitSupportedLngs: true,

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "app_lang", // our key
    },

    resources: {
      en: { common: enCommon },
      hi: { common: hiCommon },
      ta: { common: taCommon },
    },

    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
