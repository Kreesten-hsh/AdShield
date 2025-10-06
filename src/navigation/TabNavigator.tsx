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
    const { theme } = useAppTheme() as unknown as { theme: ThemeProps };

    // --- SÉLECTION D'ICÔNES FINALE (Bouclier pour Accueil, Classiques pour le reste) ---
    const getTabIcon = (routeName: string, focused: boolean) => {
        let iconName: string;
        
        if (routeName === 'Accueil') {
            // Choix FINAL: Bouclier stylisé pour l'écran de protection
            iconName = focused ? 'shield-sharp' : 'shield-outline'; 
        } else if (routeName === 'Stats') {
            // Stats: Graphique à barres
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        } else if (routeName === 'Réglages') {
            // Réglages: Engrenage classique et propre
            iconName = focused ? 'cog' : 'cog-outline';
        } else {
            iconName = 'help-circle-outline';
        }
        return iconName;
    };
    
    // Taille de l'icône ajustée pour une touche plus moderne
    const ICON_SIZE_BASE = 26;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                
                // --- STYLES DE LA BARRE DE NAVIGATION (Maintenus)
                tabBarStyle: {
                    backgroundColor: theme.cardBackground,
                    borderTopWidth: 0, 
                    
                    // Ombre douce pour simuler la flottaison
                    elevation: 15, 
                    shadowColor: '#000',
                    shadowOpacity: 0.15, 
                    shadowOffset: { width: 0, height: -5 },
                    shadowRadius: 15, 
                    
                    // Coins arrondis
                    borderTopLeftRadius: 25, 
                    borderTopRightRadius: 25, 
                    
                    // Hauteur ajustée
                    height: Platform.OS === 'ios' ? 95 : 80, 
                    
                    paddingTop: 12,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 15, 
                    
                    position: 'absolute',
                },
                
                // Styles de l'étiquette (label)
                tabBarLabelStyle: {
                    fontSize: 12, 
                    fontWeight: '600',
                },

                // Logique pour les icônes (Utilisation des icônes pleines/contourées)
                tabBarIcon: ({ color, focused }) => {
                    const iconName = getTabIcon(route.name, focused);
                    // L'icône active est légèrement agrandie (effet "pop-out")
                    const customSize = focused ? ICON_SIZE_BASE + 2 : ICON_SIZE_BASE;
                    
                    return (
                        <Ionicons 
                            name={iconName} 
                            color={color} 
                            size={customSize} 
                        />
                    );
                },
            })}
        >
            {/* 1. ÉCRAN D'ACCUEIL (Bouclier) */}
            <Tab.Screen
                name="Accueil"
                component={HomeScreen}
            />

            {/* 2. ÉCRAN DE STATISTIQUES (Graphique) */}
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
            />

            {/* 3. ÉCRAN DE RÉGLAGES (Engrenage) */}
            <Tab.Screen
                name="Réglages"
                component={SettingsScreen}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;