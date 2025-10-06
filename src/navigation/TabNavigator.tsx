import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

// Type pour le hook de thème (pour la clarté)
interface ThemeProps {
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    separator: string;
}

const TabNavigator = () => {
    // Cast pour s'assurer que TypeScript gère correctement la structure du thème
    const { theme } = useAppTheme() as unknown as { theme: ThemeProps };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                
                // --- STYLES DE LA BARRE DE NAVIGATION
                tabBarStyle: {
                    backgroundColor: theme.cardBackground,
                    // Suppression de la bordure supérieure par défaut
                    borderTopWidth: 0, 
                    
                    // Ombre pour simuler la flottaison
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: -5 },
                    shadowRadius: 10,
                    
                    // Coins arrondis sur les bords supérieurs
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    
                    // Hauteur ajustée pour iOS et Android
                    height: Platform.OS === 'ios' ? 90 : 80,
                    

                    paddingTop: 12,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    
                    position: 'absolute',
                },
                
                // Styles de l'étiquette (label)
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '600',
                },

                // Logique pour les icônes (Utilisation des icônes pleines/contourées)
                tabBarIcon: ({ color, focused }) => { // Suppression de 'size' dans la déstructuration
                let iconName: string;
                const customSize = 25; // Agrandir l'icône si sélectionnée
                    
                    if (route.name === 'Accueil') {
                        iconName = focused ? 'shield-checkmark' : 'shield-outline';
                    } else if (route.name === 'Stats') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Réglages') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else {
                        iconName = 'help-circle-outline';
                    }

                    return <Ionicons name={iconName} color={color} size={customSize} />;
                },
            })}
        >
            {/* 1. ÉCRAN D'ACCUEIL */}
            <Tab.Screen
                name="Accueil"
                component={HomeScreen}
            />

            {/* 2. ÉCRAN DE STATISTIQUES */}
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
            />

            {/* 3. ÉCRAN DE RÉGLAGES */}
            <Tab.Screen
                name="Réglages"
                component={SettingsScreen}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;