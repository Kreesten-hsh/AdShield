// src/context/ShieldContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

// 1. Définition du type de contexte
interface ShieldContextType {
  isShieldActive: boolean;
  toggleShield: () => void;
}

// 2. Création du Contexte
const ShieldContext = createContext<ShieldContextType | undefined>(undefined);

// Clé pour AsyncStorage
const SHIELD_KEY = '@app_shield_status'; 

// 3. Hook personnalisé pour utiliser le contexte
export const useShield = () => {
  const context = useContext(ShieldContext);
  if (!context) {
    throw new Error('useShield must be used within a ShieldProvider');
  }
  return context;
};

// 4. Composant Provider
interface ShieldProviderProps {
  children: ReactNode;
}

export const ShieldProvider: React.FC<ShieldProviderProps> = ({ children }) => {
  const [isShieldActive, setIsShieldActive] = useState(true); // Défaut: actif
  const [isReady, setIsReady] = useState(false); // Attendre le chargement de AsyncStorage

  // CHARGEMENT initial au démarrage
  useEffect(() => {
    const loadShieldStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem(SHIELD_KEY);
        if (storedStatus !== null) {
          // Convertit la chaîne 'true'/'false' en booléen
          setIsShieldActive(storedStatus === 'true');
        }
      } catch (e) {
        console.error("Failed to load shield status from storage", e);
      } finally {
        setIsReady(true);
      }
    };
    loadShieldStatus();
  }, []);
  

  // SAUVEGARDE à chaque changement
  const toggleShield = () => {
    setIsShieldActive(prev => {
      const newState = !prev;
      AsyncStorage.setItem(SHIELD_KEY, newState.toString()).catch(e => {
        console.error("Failed to save shield status to storage", e);
      });
      // Call native module to start/stop VPN
      if (NativeModules.AdShield && NativeModules.AdShield.startNativeShield) {
        NativeModules.AdShield.startNativeShield(newState)
          .then((result: any) => {
            console.log("Native module startNativeShield result:", result);
          })
          .catch((error: any) => {
            console.error("Native module startNativeShield error:", error);
          });
      } else {
        console.warn("NativeModules.AdShield.startNativeShield is not available");
      }
      return newState;
    });
  };

  const value = { isShieldActive, toggleShield };

  // Afficher le contenu uniquement après le chargement
  if (!isReady) {
    return null; 
  }

  return (
    <ShieldContext.Provider value={value}>
      {children}
    </ShieldContext.Provider>
  );
};