// src/screens/SettingsScreen.tsx

import React, { useState, useRef, useEffect } from 'react'; // 🚨 Ajout de useRef et useEffect
import {
    SafeAreaView, Text, StyleSheet, View, StatusBar, ScrollView, TouchableOpacity, Switch, Alert, Animated // 🚨 Import de Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAppTheme } from '../theme/ThemeContext';
import { useShield } from '../context/ShieldContext'; 

// --- Composant réutilisable pour une ligne d'option avec interrupteur (ANIMÉ) ---
const SettingsToggleItem = ({ label, value, onValueChange, theme }: any) => {
    // 🚨 1. Initialiser la valeur animée pour la couleur de fond
    const animatedBg = useRef(new Animated.Value(0)).current;

    // 🚨 2. Déclencher l'animation lorsque 'value' change
    useEffect(() => {
        // Démarre l'animation : 0 -> 1 (flash) -> 0 (retour à la normale)
        Animated.sequence([
            // Flash (de 0 à 1 en 100ms)
            Animated.timing(animatedBg, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false, // Nécessaire pour l'animation de couleur
            }),
            // Retour à la normale (de 1 à 0 en 400ms)
            Animated.timing(animatedBg, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
            }),
        ]).start();
    }, [value]); // Regarde si l'état de l'interrupteur a changé

    // Interpolation des couleurs
    const flashColor = theme.isDarkMode ? '#343434' : '#f0f0f0'; // Couleur du flash (plus clair que le fond)
    
    // 🚨 3. Mapper la valeur animée à la couleur d'arrière-plan
    const backgroundColor = animatedBg.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.cardBackground, flashColor], // De la couleur de la carte à la couleur du flash
    });

    const itemStyles = StyleSheet.create({
        toggleItem: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingVertical: 14, 
            paddingHorizontal: 15, 
            borderBottomWidth: 1, 
        },
        itemLabel: { fontSize: 16, flex: 1, },
    });

    return (
        // 🚨 Utiliser Animated.View pour le conteneur et appliquer la couleur animée
        <Animated.View style={[
            itemStyles.toggleItem, 
            { 
                borderBottomColor: theme.separator, 
                backgroundColor: backgroundColor // Appliquer la couleur animée
            }
        ]}>
            <Text style={[itemStyles.itemLabel, { color: theme.textPrimary }]}>{label}</Text>
            <Switch
                trackColor={{ false: theme.separator, true: theme.success }}
                thumbColor={value ? theme.background : '#f4f3f4'} // Couleur du thème pour le pouce (thumb)
                onValueChange={onValueChange}
                value={value}
            />
        </Animated.View>
    );
};

// --- Composant réutilisable pour une ligne de lien ou d'information (Non animé) ---
const SettingsLinkItem = ({ label, value, iconName, onPress, theme }: any) => {
    // Pas d'animation pour les liens ici
    const itemStyles = StyleSheet.create({
        linkItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
        },
        linkItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1, },
        linkItemValue: { flexDirection: 'row', alignItems: 'center', },
        linkIcon: { marginRight: 10, },
        itemLabel: { fontSize: 16, flex: 1, },
        itemValueText: { fontSize: 16, marginRight: 5, }
    });

    return (
        <TouchableOpacity 
            style={[itemStyles.linkItem, { borderBottomColor: theme.separator, backgroundColor: theme.cardBackground }]} // Couleur de fond normale
            onPress={onPress}
            activeOpacity={onPress ? 0.6 : 1} 
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
const SettingsScreen = () => {
    // Pour assurer que le "thumbColor" utilise le bon fond, nous passons le thème complet.
    const { theme, isDarkMode, toggleTheme } = useAppTheme();
    const { isShieldActive, toggleShield } = useShield(); 
    
    const [isSocialBlocking, setIsSocialBlocking] = useState(true);
    const [isVideoBlocking, setIsVideoBlocking] = useState(false);
    
    const handleClone = () => { Alert.alert("Info", "Fonction Cloner les listes activée !"); };

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
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground }]}>
                    <SettingsToggleItem label="Blocage général" value={isShieldActive} onValueChange={toggleShield} theme={theme}/>
                    <SettingsToggleItem label="Bloqueurs Social" value={isSocialBlocking} onValueChange={setIsSocialBlocking} theme={theme}/>
                    <SettingsToggleItem label="Bloqueurs vidéo" value={isVideoBlocking} onValueChange={setIsVideoBlocking} theme={theme}/>
                </View>

                {/* GROUPE 3: GESTION ET CLONAGE */}
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>Gestion des Listes</Text>
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground }]}>
                    <SettingsLinkItem label="Cloner les listes" onPress={handleClone} theme={theme}/>
                </View>
                
                {/* GROUPE 4: INFORMATION */}
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>Information</Text>
                <View style={[styles.groupContainer, { backgroundColor: theme.cardBackground }]}>
                    <SettingsLinkItem label="Liste blanche" iconName="list-outline" onPress={() => Alert.alert("Info", "Ouvrir la liste blanche")} theme={theme}/>
                    <SettingsLinkItem label="À propos de l'application" iconName="information-circle-outline" onPress={() => Alert.alert("Info", "Ouvrir l'écran À propos")} theme={theme}/>
                    <SettingsLinkItem label="Version" value="1.5.3" iconName="code-slash-outline" theme={theme}/>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// Styles statiques et de structure pour l'écran
const styles = StyleSheet.create({
    container: { flex: 1, },
    header: { padding: 15, borderBottomWidth: 1, },
    headerTitle: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', paddingTop: 25, },
    scrollViewContent: { padding: 15, },
    
    groupTitle: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8, paddingHorizontal: 5, },
    groupContainer: { 
        borderRadius: 12, 
        overflow: 'hidden', 
        elevation: 1, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowOffset: { width: 0, height: 1 }, 
        shadowRadius: 2, 
    },
});

export default SettingsScreen;