import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    SafeAreaView, Text, StyleSheet, View, StatusBar, ScrollView, TouchableOpacity, Switch, Alert, Animated, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAppTheme } from '../theme/ThemeContext';
import { useShield } from '../context/ShieldContext'; 

// --- 1. Définition des Types pour la Robustesse ---

// Définition de la structure minimale attendue de useAppTheme pour le typage
type ThemeProps = {
    background: string;
    cardBackground: string;
    textPrimary: string; // Corrected: textPrimary should exist
    textSecondary: string;
    separator: string;
    primary: string;
    success: string;
    isDarkMode?: boolean; // Rendre optionnel
    toggleTheme?: () => void; // Rendre optionnel
};

type SettingsItemProps = {
    label: string;
    theme: ThemeProps;
};

type SettingsToggleProps = SettingsItemProps & {
    value: boolean;
    onValueChange: (value: boolean) => void;
};

type SettingsLinkProps = SettingsItemProps & {
    value?: string;
    iconName?: string;
    onPress?: () => void;
    isLast?: boolean; // Pour enlever la ligne de séparation du dernier élément
};

// --- 2. Composants Modulaires et Animés ---

/**
 * Composant de ligne d'option avec interrupteur (Animé)
 */
const SettingsToggleItem: React.FC<SettingsToggleProps> = ({ label, value, onValueChange, theme }) => {
    const animatedBg = useRef(new Animated.Value(0)).current;

    // Déclencher une animation 'flash' lorsque l'état change
    useEffect(() => {
        Animated.sequence([
            Animated.timing(animatedBg, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(animatedBg, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
            }),
        ]).start();
    }, [value, animatedBg]); // Ajout de 'animatedBg' comme dépendance

    // Définir la couleur du flash
    const flashColor = theme.isDarkMode ? '#343434' : '#f0f0f0'; 
    
    const backgroundColor = animatedBg.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.cardBackground, flashColor], 
    });

    const itemStyles = useMemo(() => StyleSheet.create({
        toggleItem: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingVertical: 14, 
            paddingHorizontal: 15, 
        },
        itemLabel: { fontSize: 16, flex: 1, },
    }), []); // Styles statiques pour une meilleure performance

    return (
        <Animated.View style={[
            itemStyles.toggleItem, 
            { 
                borderBottomColor: theme.separator, 
                backgroundColor: backgroundColor, // Appliquer la couleur animée
            }
        ]}>
            <Text style={[itemStyles.itemLabel, { color: theme.textPrimary }]}>{label}</Text>
            <Switch
                trackColor={{ false: theme.separator, true: theme.success }}
                thumbColor={Platform.OS === 'android' ? (value ? theme.success : '#f4f3f4') : (value ? theme.primary : '#f4f3f4')}
                onValueChange={onValueChange}
                value={value}
            />
        </Animated.View>
    );
};

/**
 * Composant de ligne de lien ou d'information
 */
const SettingsLinkItem: React.FC<SettingsLinkProps> = ({ label, value, iconName, onPress, theme, isLast }) => {
    
    const itemStyles = useMemo(() => StyleSheet.create({
        linkItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 15,
        },
        linkItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1, },
        linkItemValue: { flexDirection: 'row', alignItems: 'center', },
        linkIcon: { marginRight: 10, },
        itemLabel: { fontSize: 16, flex: 1, },
        itemValueText: { fontSize: 16, marginRight: 5, }
    }), []);

    return (
        <TouchableOpacity 
            style={[
                itemStyles.linkItem, 
                { 
                    backgroundColor: theme.cardBackground,
                    borderBottomWidth: isLast ? 0 : 1, // Supprimer la bordure du dernier élément
                    borderBottomColor: theme.separator 
                }
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.6 : 1} 
            disabled={!onPress} // Désactiver le TouchableOpacity s'il n'y a pas d'action (comme pour la version)
        >
            <View style={itemStyles.linkItemContent}>
                {iconName && <Ionicons name={iconName} size={20} color={theme.textSecondary} style={itemStyles.linkIcon} />}
                <Text style={[itemStyles.itemLabel, { color: theme.textPrimary }]}>{label}</Text>
            </View>
            
            <View style={itemStyles.linkItemValue}>
                {value && <Text style={[itemStyles.itemValueText, { color: theme.textSecondary }]}>{value}</Text>}
                {onPress && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
            </View>
        </TouchableOpacity>
    );
};


/**
 * Écran principal des Paramètres
 */
const SettingsScreen: React.FC = () => {
    // Note: useAppTheme() est appelé en premier ici (Règle des Hooks OK)
    const { theme, isDarkMode, toggleTheme } = useAppTheme();
    const { isShieldActive, toggleShield } = useShield(); 
    
    // États locaux pour les sous-options
    const [isSocialBlocking, setIsSocialBlocking] = useState(true);
    const [isVideoBlocking, setIsVideoBlocking] = useState(false);
    
    // Fonctionnalité pour la liste clonée (Utilisation de useCallback pour la performance)
    const handleClone = useCallback(() => { 
        Alert.alert(
            "Cloner les listes", 
            "La fonction de clonage des listes (Whitelist/Blacklist) sera bientôt disponible.",
            [{ text: "OK" }]
        ); 
    }, []);

    // Fonctionnalité pour la liste blanche
    const handleWhitelist = useCallback(() => {
        Alert.alert(
            "Liste blanche", 
            "L'écran de gestion de la liste blanche s'ouvrira ici.",
            [{ text: "OK" }]
        );
    }, []);
    
    // Fonctionnalité 'À propos'
    const handleAbout = useCallback(() => {
        Alert.alert(
            "À propos de AdShield", 
            "Version 1.5.3\n\nDéveloppé pour un web plus rapide et plus sûr.",
            [{ text: "Fermer" }]
        );
    }, []);
    
    // Détermination de l'état des options pour les désactiver si le bouclier est inactif
    const isOptionsDisabled = !isShieldActive;


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            
            {/* HEADER */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.separator }]}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Paramètres</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                {/* GROUPE 1: AFFICHAGE (Mode Sombre) */}
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>Affichage</Text>
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground }]}>
                    <SettingsToggleItem label="Mode Sombre (Dark Mode)" value={isDarkMode} onValueChange={toggleTheme} theme={theme}/>
                </View>

                {/* GROUPE 2: PARAMÈTRES DE BLOCAGE */}
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>Paramètres de Blocage</Text>
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground, opacity: isOptionsDisabled ? 0.5 : 1 }]}>
                    {/* Le toggle principal doit toujours fonctionner */}
                    <SettingsToggleItem label="Blocage général (Shield)" value={isShieldActive} onValueChange={toggleShield} theme={theme}/>

                    {/* Les sous-options sont contrôlées par le toggle général */}
                    <View style={{ pointerEvents: isOptionsDisabled ? 'none' : 'auto' }}>
                        <SettingsToggleItem label="Bloqueurs Social" value={isSocialBlocking} onValueChange={setIsSocialBlocking} theme={theme}/>
                        <SettingsToggleItem label="Bloqueurs vidéo" value={isVideoBlocking} onValueChange={setIsVideoBlocking} theme={theme}/>
                    </View>
                </View>

                {/* GROUPE 3: GESTION ET CLONAGE */}
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>Gestion des Listes</Text>
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground }]}>
                    <SettingsLinkItem label="Cloner les listes" onPress={handleClone} theme={theme}/>
                    <SettingsLinkItem label="Liste blanche" iconName="list-outline" onPress={handleWhitelist} theme={theme} isLast={true} />
                </View>
                
                {/* GROUPE 4: INFORMATION */}
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>Information</Text>
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground }]}>
                    <SettingsLinkItem label="À propos de l'application" iconName="information-circle-outline" onPress={handleAbout} theme={theme}/>
                    {/* Le dernier item est une information, sans onPress et sans bordure */}
                    <SettingsLinkItem label="Version" value="1.5.3" iconName="code-slash-outline" theme={theme} isLast={true}/>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// Styles statiques et de structure pour l'écran
const styles = StyleSheet.create({
    container: { flex: 1, },
    header: { padding: 15, borderBottomWidth: 1, },
    headerTitle: { fontSize: 26, fontWeight: 'bold', paddingTop: 30, },
    scrollViewContent: { padding: 15, paddingBottom: 120},
    
    groupTitle: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8, paddingHorizontal: 5, },
    groupContainer: { 
        borderRadius: 12, 
        overflow: 'hidden', 
        // Note: Suppression du borderBottomWidth/Color ici car il est géré par les items
        elevation: 1, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowOffset: { width: 0, height: 1 }, 
        shadowRadius: 2, 
        marginBottom: 5,
    },
});

export default SettingsScreen;