// src/theme/colors.ts

import { useColorScheme, ColorSchemeName } from 'react-native';

// Définition des couleurs de base
const BASE_COLORS = {
    BLUE_PRIMARY: '#1e40af', // Bleu foncé
    GREEN_SUCCESS: '#4CAF50', // Vert (Actif)
    RED_ERROR: '#E53935', // Rouge (Désactiver)
};

// --- PALETTE CLAIRE (Light Mode) ---
export const LightTheme = {
    background: '#ffffff',
    textPrimary: '#333333',
    textSecondary: '#666666',
    cardBackground: '#ffffff',
    separator: '#f0f4f8',
    statusBar: BASE_COLORS.BLUE_PRIMARY,
    
    // Accents
    primary: BASE_COLORS.BLUE_PRIMARY,
    success: BASE_COLORS.GREEN_SUCCESS,
    error: BASE_COLORS.RED_ERROR,
    // Couleurs spécifiques à la carte d'accueil
    shieldAreaBg: '#e0f7fa',
    shieldText: '#333333',
};

// --- PALETTE SOMBRE (Dark Mode) ---
export const DarkTheme = {
    background: '#121212', 
    textPrimary: '#f0f0f0', 
    textSecondary: '#a0a0a0', 
    cardBackground: '#1e1e1e',
    separator: '#2a2a2a',
    statusBar: '#121212',
    
    // Accents
    primary: '#60a5fa', 
    success: '#81c784',
    error: '#ef9a9a',
    // Couleurs spécifiques à la carte d'accueil
    shieldAreaBg: '#1e1e1e',
    shieldText: '#f0f0f0',
};

// Type pour garantir l'uniformité des thèmes
export type AppTheme = typeof LightTheme;

/**
 * Hook personnalisé pour obtenir le thème actuel (Dark ou Light)
 */
export const useCurrentTheme = (): AppTheme => {
  const scheme: ColorSchemeName = useColorScheme();
  // Retourne le DarkTheme si le système est en sombre, sinon le LightTheme
  return scheme === 'dark' ? DarkTheme : LightTheme;
};