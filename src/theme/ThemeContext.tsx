// src/theme/ThemeContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { LightTheme, DarkTheme, AppTheme } from './colors'; 

// Définition du type de contexte (inclut le thème lui-même)
interface ThemeContextType {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Clé pour AsyncStorage
const THEME_KEY = '@app_theme_mode'; 

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Défaut: clair
  const [isReady, setIsReady] = useState(false); // Attendre le chargement de AsyncStorage

  // CHARGEMENT initial au démarrage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_KEY);
        if (storedMode !== null) {
          setIsDarkMode(storedMode === 'true');
        }
      } catch (e) {
        console.error("Failed to load theme from storage", e);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  // SAUVEGARDE à chaque changement
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newState = !prev;
      AsyncStorage.setItem(THEME_KEY, newState.toString()).catch(e => {
        console.error("Failed to save theme to storage", e);
      });
      return newState;
    });
  };

  const theme = isDarkMode ? DarkTheme : LightTheme;
  const value = { theme, isDarkMode, toggleTheme };

  // Afficher le contenu uniquement après le chargement
  if (!isReady) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};