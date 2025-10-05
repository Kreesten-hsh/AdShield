// src/utils/filterLogic.ts

import { NativeModules } from 'react-native';

// 🚨 Référence au module Kotlin que vous venez de créer (NativeModules.AdShield)
const AdShieldNativeModule = NativeModules.AdShield;

export const BLOCKLIST: string[] = [
    "googleadservices.com",
    "doubleclick.net",
    "facebook.com",
    "analytics.com",
    "ad.company.com",
    "tracker.io",
    "pixel.xyz",
    "metrics.net",
    "adserver.com",
    "criteo.com",
    "pubmatic.com",
    "adsrvr.org",
    "scorecardresearch.com",
    "bing.com/ads",
];

export const ALLOWED_LIST: string[] = [
    "apple.com", 
    "microsoft.com", 
    "github.com", 
    "wikipedia.org", 
    "amazon.com", 
    "reddit.com", 
    "google.com", 
    "youtube.com", 
    "reactnative.dev"
];

export const isDomainBlocked = (domain: string): boolean => {
    if (!domain) return false;
    
    const normalizedDomain = domain.toLowerCase();
    
    return BLOCKLIST.some(blockedItem => normalizedDomain.includes(blockedItem));
};

export const getRandomAllowedDomain = (): string => {
    const randomIndex = Math.floor(Math.random() * ALLOWED_LIST.length);
    return ALLOWED_LIST[randomIndex];
};

/**
 * 🚨 NOUVELLE FONCTION
 * Appelle la fonction Native (Kotlin) pour démarrer/arrêter le service VPN.
 */
export const startNativeShield = (isActive: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (isActive) {
            // Appelle la méthode Kotlin startVPNService
            AdShieldNativeModule.startVPNService((error: string | null, message: string | null) => {
                if (error) {
                    reject(`Échec du démarrage du VPN: ${error}`);
                } else {
                    resolve(message || "Service démarré (réponse native vide)");
                }
            });
        } else {
            // Dans un vrai cas, on appellerait une fonction d'arrêt.
            // Ici, nous simulons la réponse native d'arrêt immédiat.
            resolve("Service VPN AdShield arrêté avec succès !");
        }
    });
};