"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "es" | "en";

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  // Cargar preferencias del localStorage al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLanguage = localStorage.getItem("language") as Language;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Por defecto: Dark mode siempre
      setTheme("dark");
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Por defecto: Español siempre
      setLanguage("es");
    }
    
    setMounted(true);
  }, []);

  // Aplicar tema al HTML
  useEffect(() => {
    if (mounted) {
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      html.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  // Guardar idioma
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("language", language);
    }
  }, [language, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "es" ? "en" : "es");
  };

  // Evitar hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, toggleLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
