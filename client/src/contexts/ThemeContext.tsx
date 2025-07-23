
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import themesData from '@config/themes.json';

// Define the shape of a theme
export interface Theme {
  name: string;
  colors: Record<string, string>;
}

// Define the shape of the context
interface ThemeContextType {
  themes: Theme[];
  currentTheme: Theme | null;
  setTheme: (themeName: string) => void;
  isLoading: boolean;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to apply a theme
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load themes from the imported JSON file on mount
  useEffect(() => {
    try {
      const themesArray = themesData as Theme[];
      setThemes(themesArray);

      // Load saved theme or set default
      const savedThemeName = localStorage.getItem('pixel-arena-theme') || themesArray[0].name;
      const initialTheme = themesArray.find(t => t.name === savedThemeName) || themesArray[0];

      if (initialTheme) {
        setCurrentTheme(initialTheme);
        applyTheme(initialTheme);
      }

    } catch (error) {
      console.error("Error loading themes:", error);
      // Fallback to CSS variables if themes.json fails to load
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to change the theme
  const setTheme = useCallback((themeName: string) => {
    const newTheme = themes.find(t => t.name === themeName);
    if (newTheme) {
      setCurrentTheme(newTheme);
      applyTheme(newTheme);
      localStorage.setItem('pixel-arena-theme', newTheme.name);
    }
  }, [themes]);

  const value = { themes, currentTheme, setTheme, isLoading };

  return (
    <ThemeContext.Provider value={value}>
      {!isLoading && children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
