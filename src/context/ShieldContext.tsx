import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, NativeEventEmitter } from 'react-native';

type VpnStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'CHECKING';

interface ShieldContextType {
  isShieldActive: boolean;
  vpnStatus: VpnStatus; 
  blockedCount: number; 
  toggleShield: () => void;
}

// Référence au module natif
const AdShieldModule = NativeModules.AdShield;

// 3. Création du Contexte
const ShieldContext = createContext<ShieldContextType | undefined>(undefined);

// Clés pour AsyncStorage
const SHIELD_KEY = '@app_shield_status';
const BLOCKED_COUNT_KEY = '@app_blocked_count';

// 4. Hook personnalisé pour utiliser le contexte
export const useShield = () => {
  const context = useContext(ShieldContext);
  if (!context) {
    throw new Error('useShield must be used within a ShieldProvider');
  }
  return context;
};

// 5. Composant Provider
interface ShieldProviderProps {
  children: ReactNode;
}

export const ShieldProvider: React.FC<ShieldProviderProps> = ({ children }) => {
  // --- DÉCLARATION DES HOOKS (DOIVENT ÊTRE EN HAUT ET NON CONDITIONNELS) ---
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [vpnStatus, setVpnStatus] = useState<VpnStatus>('DISCONNECTED');
  const [blockedCount, setBlockedCount] = useState(0);
  const [isReady, setIsReady] = useState(false); 

  // Fonction pour appeler le module natif
  const callNativeShield = useCallback((newState: boolean) => {
    if (AdShieldModule && AdShieldModule.startNativeShield) {
      setVpnStatus('CHECKING');
      AdShieldModule.startNativeShield(newState)
        .then((result: string) => {
          console.log("Native module startNativeShield success:", result);
          // Le statut réel sera mis à jour par l'écouteur natif
        })
        .catch((error: any) => {
          console.error("Native module startNativeShield error:", error);
          setVpnStatus('ERROR');
        });
    } else {
      console.warn("NativeModules.AdShield.startNativeShield is not available.");
      setVpnStatus(newState ? 'CONNECTED' : 'DISCONNECTED');
    }
  }, []); 

  // --- EFFETS SECONDAIRES ---

  // 1. Chargement initial de l'état (AsyncStorage) et démarrage du VPN
  useEffect(() => {
    const loadShieldData = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem(SHIELD_KEY);
        const storedCount = await AsyncStorage.getItem(BLOCKED_COUNT_KEY);

        const initialStatus = storedStatus === 'true';
        setIsShieldActive(initialStatus);
        
        if (storedCount !== null) {
            setBlockedCount(parseInt(storedCount, 10));
        }

        if (initialStatus) {
           callNativeShield(true);
        }

      } catch (e) {
        console.error("Failed to load shield data from storage", e);
      } finally {
        setIsReady(true);
      }
    };
    loadShieldData();
  }, [callNativeShield]);


  // 2. Gestion des écouteurs d'événements natifs (Résout les problèmes de NativeEventEmitter)
  useEffect(() => {
    if (!AdShieldModule) {
        // Le module n'est pas prêt
        console.warn("AdShieldModule is not available for event listening.");
        return;
    }
    
    // Initialisation de l'Emitter à l'intérieur du useEffect
    const AdShieldEmitter = new NativeEventEmitter(AdShieldModule);

    // Écouteur pour le statut du VPN
    const statusListener = AdShieldEmitter.addListener('onVpnStatusChange', (event: { status: VpnStatus }) => {
        setVpnStatus(event.status);
        
        // Synchronisation de l'interrupteur avec l'état réel du VPN
        if (event.status === 'ERROR' || event.status === 'DISCONNECTED') {
            setIsShieldActive(false);
        } else if (event.status === 'CONNECTED') {
            setIsShieldActive(true);
        }
    });

    // Écouteur pour les publicités bloquées
    const blockedListener = AdShieldEmitter.addListener('onAdBlocked', (event: { domain: string }) => {
        setBlockedCount(prev => {
            const newCount = prev + 1;
            AsyncStorage.setItem(BLOCKED_COUNT_KEY, newCount.toString()).catch(e => {
                console.error("Failed to save blocked count", e);
            });
            return newCount;
        });
    });

    // Fonction de nettoyage (très importante)
    return () => {
        statusListener.remove();
        blockedListener.remove();
    };
  }, []); // Dépendances vides pour n'exécuter qu'au montage/démontage


  // GESTION DU TOGGLE (appelé par le composant UI)
  const toggleShield = () => {
    setIsShieldActive(prev => {
      const newState = !prev;
      
      AsyncStorage.setItem(SHIELD_KEY, newState.toString()).catch(e => {
        console.error("Failed to save shield status to storage", e);
      });
      
      callNativeShield(newState);

      return newState;
    });
  };

  const value = { isShieldActive, vpnStatus, blockedCount, toggleShield };

  if (!isReady) {
    return null; // Affiche un écran de chargement si vous le souhaitez
  }

  return (
    <ShieldContext.Provider value={value}>
      {children}
    </ShieldContext.Provider>
  );
};