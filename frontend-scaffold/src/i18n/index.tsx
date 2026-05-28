import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import pt from "./pt.json";

export type Language = "en" | "es" | "fr" | "pt";

const STORAGE_KEY = "tipz_lang";
const RTL_LANGUAGES = new Set<string>(["ar", "he", "fa", "ur"]);
const dictionaries: Record<Language, Record<string, string>> = {
  en,
  es,
  fr,
  pt,
};

const languageNames: Record<Language, string> = {
  en: "English",
  es: "Espanol",
  fr: "Francais",
  pt: "Portugues",
};

interface I18nContextValue {
  language: Language;
  languageNames: Record<Language, string>;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const isLanguage = (value: string | null): value is Language =>
  value === "en" || value === "es" || value === "fr" || value === "pt";

const detectLanguage = (): Language => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLanguage(stored)) return stored;

  const browserLanguage = window.navigator.language.slice(0, 2);
  return isLanguage(browserLanguage) ? browserLanguage : "en";
};

const interpolate = (
  value: string,
  params: Record<string, string | number> = {},
) =>
  Object.entries(params).reduce(
    (text, [key, replacement]) =>
      text.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), String(replacement)),
    value,
  );

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() =>
    detectLanguage(),
  );

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      languageNames,
      setLanguage,
      t: (key, params) =>
        interpolate(
          dictionaries[language][key] || dictionaries.en[key] || key,
          params,
        ),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
};
