import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "normal", setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = "nicadriver_theme"; // 'light' | 'normal' | 'dark'

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "normal");

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-normal", "theme-dark");
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
