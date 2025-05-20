
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Support for both color modes and color schemes
type Theme = "dark" | "light" | "coloured";
type ColorScheme = "blue" | "red" | "purple" | "magenta" | "teal" | "green" | "yellow" | "orange" | "default";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ColorScheme;
  storageThemeKey?: string;
  storageColorKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  colorScheme: "default",
  setTheme: () => null,
  setColorScheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultColorScheme = "default",
  storageThemeKey = "theme",
  storageColorKey = "colorScheme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      try {
        const storedTheme = localStorage.getItem(storageThemeKey);
        return (storedTheme as Theme) || defaultTheme;
      } catch (e) {
        return defaultTheme;
      }
    }
  );
  
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    () => {
      try {
        const storedColorScheme = localStorage.getItem(storageColorKey);
        return (storedColorScheme as ColorScheme) || defaultColorScheme;
      } catch (e) {
        return defaultColorScheme;
      }
    }
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme and color scheme classes first
    root.classList.remove("light", "dark", "coloured");
    root.classList.remove(
      "theme-default", 
      "theme-blue", 
      "theme-red",
      "theme-purple", 
      "theme-magenta",
      "theme-teal",
      "theme-green", 
      "theme-yellow",
      "theme-orange"
    );
    
    // Apply theme (dark/light/coloured)
    root.classList.add(theme);
    
    // Apply color scheme
    root.classList.add(`theme-${colorScheme}`);
  }, [theme, colorScheme]);

  const value = {
    theme,
    colorScheme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageThemeKey, newTheme);
      } catch (e) {
        console.error("Failed to save theme to localStorage", e);
      }
      setTheme(newTheme);
    },
    setColorScheme: (newColorScheme: ColorScheme) => {
      try {
        localStorage.setItem(storageColorKey, newColorScheme);
      } catch (e) {
        console.error("Failed to save color scheme to localStorage", e);
      }
      setColorScheme(newColorScheme);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
