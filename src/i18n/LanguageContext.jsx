import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({ lang: "es", setLang: () => {} });

export const useLanguage = () => useContext(LanguageContext);

const LANG_KEY = "nicadriver_lang"; // 'es' | 'en' | 'zh'

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || "es");

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
