import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAppTheme } from '../theme/ThemeContext';
import { useShield } from '../context/ShieldContext'; 

// --- 1. Définition des Types ---

type ThemeColorKey = 'success' | 'warning' | 'error' | 'disconnected';
type VpnStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'CHECKING';

// Définition du type CustomTheme incluant les couleurs dynamiques nécessaires
interface CustomTheme {
    background: string;
    textPrimary: string;
    textSecondary: string;
    cardBackground: string;
    separator: string;
    primary: string;
    success: string; // Doit être inclus pour l'indexation
    warning: string; // Doit être inclus pour l'indexation
    error: string;   // Doit être inclus pour l'indexation
    [key: string]: string; 
}


// --- 2. Fonction Utilitaire pour le Statut et les Couleurs (Mise à jour) ---
const getStatusProps = (vpnStatus: VpnStatus) => {
    switch (vpnStatus) {
      case 'CONNECTED':
        return { 
          icon: 'shield-checkmark', 
          mainStatusText: 'Protection Active', 
          buttonText: 'Désactiver',
          colorKey: 'success' as ThemeColorKey,
          iconColor: 'white', // Icône blanche sur fond coloré
        };
      case 'CHECKING':
        return { 
          icon: 'sync-circle-outline', 
          mainStatusText: 'Connexion en cours...', 
          buttonText: 'Vérification',
          colorKey: 'warning' as ThemeColorKey,
          iconColor: 'white',
        };
      case 'ERROR':
        return { 
          icon: 'alert-circle', 
          mainStatusText: 'Erreur de Connexion', 
          buttonText: 'Réessayer',
          colorKey: 'error' as ThemeColorKey,
          iconColor: 'white',
        };
      default: // DISCONNECTED
        return { 
          icon: 'shield-outline', 
          mainStatusText: 'Protection Désactivée', 
          buttonText: 'Activer',
          colorKey: 'error' as ThemeColorKey, // Utilisation de 'error' comme rouge pour le bouton
          iconColor: '#9E9E9E', // Icône grise pour le statut inactif
        };
    }
};

// --- 3. Composant d'Effet de Vibrement (Glow / Ring Animation) ---
const AnimatedGlowRing = ({ baseColor, isActive }: { baseColor: string, isActive: boolean }) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isActive) {
            // Animation : opacité 0 -> 0.4 -> 0.2
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(0);
        }
    }, [isActive, pulseAnim]);

    // L'interpolation gère la taille et l'opacité de l'anneau externe
    const ringScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.4],
    });

    const ringOpacity = pulseAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.4, 0],
    });
    
    // Le style statique de l'anneau
    const ringStyles = {
        position: 'absolute' as const,
        width: 200, 
        height: 200,
        marginBottom: 50,
        borderRadius: 500, 
        backgroundColor: baseColor,
        opacity: ringOpacity,
        transform: [{ scale: ringScale }],
    };

    return <Animated.View style={ringStyles} />;
};


/**
 * Composant de la Zone de Statut du Bouclier (ShieldArea)
 */
const ShieldArea: React.FC = () => {
    // CORRECTION D'ERREUR TS : Cast vers CustomTheme
    const { theme: appTheme } = useAppTheme() as unknown as { theme: CustomTheme };
    const { isShieldActive, vpnStatus, blockedCount, toggleShield } = useShield();

    const statusInfo = getStatusProps(vpnStatus as VpnStatus);
    const isDisabled = vpnStatus === 'CHECKING';
    
    // La couleur dynamique est prise du thème via la clé
    const mainColor = appTheme[statusInfo.colorKey] || appTheme.primary;
    
    // Détermine si l'animation de pulsation doit être active (Connecté uniquement)
    const isGlowActive = vpnStatus === 'CONNECTED';
    
    // Style du cercle central (Base du Shield)
    const shieldAreaBgColor = vpnStatus === 'DISCONNECTED' ? appTheme.cardBackground : mainColor;

    const dynamicStyles = useMemo(() => StyleSheet.create({
        content: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
        
        // Zone du Bouclier
        shieldWrapper: { 
            width: 180, 
            height: 180, 
            borderRadius: 90, 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: 50,
            backgroundColor: shieldAreaBgColor, // Couleur du cercle intérieur
            // Ombre portée pour donner l'impression qu'il flotte
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 8,
        },
        mainIcon: { fontSize: 80, color: statusInfo.iconColor },
        
        // Texte du Statut
        mainStatusText: { 
            fontSize: 26, 
            fontWeight: '900', 
            color: appTheme.textPrimary, 
            marginBottom: 20 
        },
        
        // Statistiques
        statsContainer: { 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            width: '100%',
            marginBottom: 50, 
            paddingHorizontal: 20,
        },
        statItem: {
            alignItems: 'center',
            paddingHorizontal: 15,
        },
        statsNumber: { 
            fontSize: 22, 
            fontWeight: 'bold', 
            color: appTheme.primary, // Utilisation de la couleur primaire pour les chiffres
        },
        statsLabel: { 
            fontSize: 14, 
            color: appTheme.textSecondary, 
            marginTop: 4 
        },
        
        // Bouton
        mainButton: { 
            width: 300, 
            paddingVertical: 18, 
            borderRadius: 12, 
            alignItems: 'center', 
            backgroundColor: mainColor, 
            opacity: isDisabled ? 0.6 : 1,
        },
        mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    }), [mainColor, shieldAreaBgColor, appTheme, isDisabled]);


    return (
        <View style={dynamicStyles.content}>
            
            {/* Zone du Bouclier / Icône (avec l'anneau animé) */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                
                {/* Anneau de lueur animé (Visible uniquement en mode connecté) */}
                {isGlowActive && <AnimatedGlowRing baseColor={mainColor} isActive={isGlowActive} />}
                
                <View style={dynamicStyles.shieldWrapper}>
                    {vpnStatus === 'CHECKING' ? (
                        <ActivityIndicator size="large" color={statusInfo.iconColor} />
                    ) : (
                        <Ionicons name={statusInfo.icon} size={80} color={statusInfo.iconColor} />
                    )}
                </View>
            </View>

            {/* Texte du Statut Principal */}
            <Text style={dynamicStyles.mainStatusText}>{statusInfo.mainStatusText}</Text>
            
            {/* Statistiques (Mise en page en deux colonnes) */}
            <View style={dynamicStyles.statsContainer}>
                
                <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statsNumber}>
                        {blockedCount.toLocaleString()}
                    </Text>
                    <Text style={dynamicStyles.statsLabel}>Pubs bloquées</Text>
                </View>

                <View style={dynamicStyles.statItem}>
                    <Text style={dynamicStyles.statsNumber}>0 MB</Text>
                    <Text style={dynamicStyles.statsLabel}>Données économisées</Text>
                </View>
            </View>
            
            {/* Bouton Activer/Désactiver */}
            <TouchableOpacity 
                style={dynamicStyles.mainButton} 
                onPress={toggleShield}
                disabled={isDisabled}
            >
                <Text style={dynamicStyles.mainButtonText}>{statusInfo.buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ShieldArea;
