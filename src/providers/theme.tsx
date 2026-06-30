import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeName = "blue" | "emerald" | "purple" | "amber";

export interface Theme {
  name: ThemeName;
  label: string;
  labelAr: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  ring: string;
  bgLight: string;
  bgDark: string;
}

export const themes: Record<ThemeName, Theme> = {
  blue: {
    name: "blue",
    label: "Blue",
    labelAr: "أزرق",
    primary: "#3b82f6",
    primaryLight: "#60a5fa",
    primaryDark: "#2563eb",
    gradient: "from-blue-500 to-indigo-600",
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-600",
    ring: "ring-blue-500",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-950",
  },
  emerald: {
    name: "emerald",
    label: "Emerald",
    labelAr: "زمردي",
    primary: "#10b981",
    primaryLight: "#34d399",
    primaryDark: "#059669",
    gradient: "from-emerald-500 to-green-600",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-green-600",
    ring: "ring-emerald-500",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-950",
  },
  purple: {
    name: "purple",
    label: "Purple",
    labelAr: "أرجواني",
    primary: "#8b5cf6",
    primaryLight: "#a78bfa",
    primaryDark: "#7c3aed",
    gradient: "from-purple-500 to-violet-600",
    gradientFrom: "from-purple-500",
    gradientTo: "to-violet-600",
    ring: "ring-purple-500",
    bgLight: "bg-purple-50",
    bgDark: "bg-purple-950",
  },
  amber: {
    name: "amber",
    label: "Amber",
    labelAr: "عنبر",
    primary: "#f59e0b",
    primaryLight: "#fbbf24",
    primaryDark: "#d97706",
    gradient: "from-amber-500 to-orange-600",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-600",
    ring: "ring-amber-500",
    bgLight: "bg-amber-50",
    bgDark: "bg-amber-950",
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  themeName: ThemeName;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.blue,
  setTheme: () => {},
  themeName: "blue",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    return (localStorage.getItem("yasco-theme") as ThemeName) || "blue";
  });

  useEffect(() => {
    localStorage.setItem("yasco-theme", themeName);
    const t = themes[themeName];
    document.documentElement.style.setProperty("--theme-primary", t.primary);
    document.documentElement.style.setProperty("--theme-primary-light", t.primaryLight);
    document.documentElement.style.setProperty("--theme-primary-dark", t.primaryDark);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], setTheme: setThemeName, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
