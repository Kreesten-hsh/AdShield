import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    SafeAreaView, Text, StyleSheet, View, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAppTheme } from '../theme/ThemeContext'; 

// --- 1. Définition des types et des données initiales ---

type DomainStat = { name: string; count: number };
type Stats = {
    totalBlocked: string;
    totalDataSaved: string;
    blockedDomains: DomainStat[];
};

const initialMockStats: Stats = {
    totalBlocked: '0',
    totalDataSaved: '0.00 GB',
    blockedDomains: [],
};

// --- 2. Hook Fonctionnel pour la Simulation et la Réinitialisation (CORRIGÉ) ---

const useStatsData = () => {
    // Tous les Hooks sont déclarés en tête de la fonction
    const [stats, setStats] = useState<Stats>(initialMockStats);
    const [baseBlocked, setBaseBlocked] = useState(0); 
    const [isLoading, setIsLoading] = useState(true);

    const generateMockStats = useCallback((currentBase: number) => {
        if (currentBase === 0) {
            currentBase = Math.floor(Math.random() * 500) + 100;
        }

        const totalBlocked = currentBase + Math.floor(Math.random() * 2000) + 500; 
        const totalDataSavedGB = (totalBlocked / 50000 * 0.7 + 0.5).toFixed(2); 

        const recentDomains = [
            { name: 'googleadservices.com', baseCount: 3000 }, 
            { name: 'facebook.com', baseCount: 1500 }, 
            { name: 'adserver.com', baseCount: 2000 }, 
            { name: 'tracking.io', baseCount: 800 }, 
            { name: 'doubleclick.net', baseCount: 500 }, 
            { name: 'analytics.com', baseCount: 100 }, 
        ];

        const blockedDomains = recentDomains
            .map(d => ({
                name: d.name,
                count: Math.max(0, d.baseCount + Math.floor(Math.random() * 500) - 1000 + (totalBlocked / 100)),
            }))
            .filter(d => d.count > 0 && Math.random() > 0.1) 
            .sort((a, b) => b.count - a.count) 
            .slice(0, 5); 

        return {
            stats: {
                totalBlocked: totalBlocked.toLocaleString('fr-FR'),
                totalDataSaved: `${totalDataSavedGB} GB`,
                blockedDomains,
            },
            newBaseBlocked: totalBlocked
        };
    }, []);

    const updateStats = useCallback(() => {
        const { stats, newBaseBlocked } = generateMockStats(baseBlocked);
        setStats(stats);
        setBaseBlocked(newBaseBlocked);
    }, [baseBlocked, generateMockStats]);

    // L'effet gère l'initialisation et l'intervalle de manière inconditionnelle
    useEffect(() => {
        if (isLoading) {
             const timer = setTimeout(() => {
                updateStats(); 
                setIsLoading(false);
             }, 1000);
             return () => clearTimeout(timer);
        }

        const interval = setInterval(updateStats, 30000); 
        return () => clearInterval(interval);
        
    }, [isLoading, updateStats]);

    // Fonction de réinitialisation
    const resetStats = () => {
        Alert.alert(
            "Réinitialiser les statistiques",
            "Êtes-vous sûr de vouloir remettre à zéro toutes vos statistiques de blocage ? Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Réinitialiser", 
                    onPress: () => {
                        setIsLoading(true);
                        setStats(initialMockStats);
                        setBaseBlocked(0); 
                        // Note: Le useEffect gérera le retour à isLoading(false) après le délai initial
                    },
                    style: 'destructive'
                },
            ]
        );
    };

    const hasStats = useMemo(() => {
        const total = parseInt(stats.totalBlocked.replace(/\D/g, ''), 10);
        return total > 0;
    }, [stats.totalBlocked]);


    return { stats, isLoading, resetStats, hasStats };
};

// --- 3. Composants d'affichage ---

type CardProps = { title: string, value: string, iconName: string };

const StatCard = ({ title, value, iconName }: CardProps) => {
    const { theme } = useAppTheme();
    
    const cardStyles = StyleSheet.create({
        statCard: {
            width: '48%',
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 15,
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 5,
        },
        cardTitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 5, },
        cardValue: { fontSize: 24, fontWeight: '900', color: theme.textPrimary, },
        cardIcon: { position: 'absolute', top: 15, right: 15, opacity: 0.3, },
    });

    return (
        <View style={cardStyles.statCard}>
            <Text style={cardStyles.cardTitle}>{title}</Text>
            <Text style={cardStyles.cardValue}>{value}</Text>
            <Ionicons name={iconName} size={24} color={theme.primary} style={cardStyles.cardIcon} />
        </View>
    );
};

type DomainItemProps = { domainName: string, count: number, isLast: boolean };

const BlockedDomainItem = ({ domainName, count, isLast }: DomainItemProps) => {
    const { theme } = useAppTheme();

    const domainStyles = StyleSheet.create({
        domainItem: {
            flexDirection: 'row',
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: theme.separator, 
        },
        leftContainer: { flexDirection: 'row', alignItems: 'center' },
        domainText: { fontSize: 15, color: theme.textPrimary, fontWeight: '500', marginLeft: 8 },
        countText: { fontSize: 15, color: theme.textSecondary, fontWeight: '600' },
    });

    return (
        <View style={domainStyles.domainItem}>
            <View style={domainStyles.leftContainer}> 
                <Ionicons name="lock-closed" size={16} color={theme.error} />
                <Text style={domainStyles.domainText}>{domainName}</Text>
            </View>
            <Text style={domainStyles.countText}>{count.toLocaleString('fr-FR')}</Text>
        </View>
    );
};


/**
 * Écran principal des Statistiques
 */
const StatsScreen: React.FC = () => {
    // ⚠️ ATTENTION : useAppTheme() est le premier Hook appelé.
    const { theme } = useAppTheme();
    
    // Le second Hook appelé (useStatsData) est maintenant un appel inconditionnel.
    const { stats, isLoading, resetStats, hasStats } = useStatsData();
    
    // Utilise une inférence de couleur pour déterminer isDarkMode
    const isDarkMode = theme.textPrimary === '#FFFFFF' || theme.textPrimary === '#FFF'; 

    const screenStyles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background, },
        header: { padding: 15, backgroundColor: theme.cardBackground, borderBottomWidth: 1, borderBottomColor: theme.separator, },
        headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 25 },
        headerTitle: { fontSize: 25, fontWeight: 'bold', color: theme.textPrimary, },
        scrollViewContent: { padding: 15, },
        
        sectionContainer: {
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            paddingHorizontal: 15,
            paddingVertical: 15,
            marginBottom: 20,
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 5,
        },
        sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 10, },
        
        chartPlaceholder: {
            height: 150,
            backgroundColor: theme.separator, 
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.primary,
            opacity: 0.7,
            justifyContent: 'center',
            alignItems: 'center',
        },
        placeholderText: { color: theme.textSecondary, fontStyle: 'italic' },
        
        emptyState: { 
            padding: 30, 
            alignItems: 'center',
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            marginBottom: 20,
        },
        emptyText: { color: theme.textSecondary, marginTop: 10, textAlign: 'center' },

        resetButton: {
            padding: 8,
            borderRadius: 20,
        }
    });

    if (isLoading) {
        return (
            <SafeAreaView style={screenStyles.container}>
                <View style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Chargement des statistiques...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={screenStyles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            
            <View style={screenStyles.header}>
                <View style={screenStyles.headerRow}>
                    <Text style={screenStyles.headerTitle}>Statistiques</Text>
                    <TouchableOpacity 
                        onPress={resetStats} 
                        style={[screenStyles.resetButton, { backgroundColor: hasStats ? theme.error : theme.separator, opacity: hasStats ? 1 : 0.5 }]}
                        disabled={!hasStats}
                    >
                        <Ionicons name="trash-outline" size={20} color={theme.background} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={screenStyles.scrollViewContent}>
                
                {/* État Vide */}
                {!hasStats && (
                    <View style={screenStyles.emptyState}>
                        <Ionicons name="stats-chart-outline" size={40} color={theme.primary} />
                        <Text style={screenStyles.emptyText}>
                            Aucune donnée bloquée pour le moment. Activez le bouclier AdShield pour commencer le filtrage !
                        </Text>
                    </View>
                )}

                {/* Contenu des Stats */}
                {hasStats && (
                    <>
                        {/* 1. Cartes de Synthèse */}
                        <View style={styles.summaryContainer}>
                            <StatCard title="Total bloqué" value={stats.totalBlocked} iconName="shield-outline" />
                            <StatCard title="Données économisées" value={stats.totalDataSaved} iconName="cloud-download-outline" />
                        </View>

                        {/* 2. Graphique */}
                        <View style={screenStyles.sectionContainer}>
                            <Text style={screenStyles.sectionTitle}>Activité des 7 derniers jours</Text>
                            <View style={screenStyles.chartPlaceholder}>
                                <Text style={screenStyles.placeholderText}>
                                    [Placeholder pour le graphique réel]
                                </Text>
                            </View>
                        </View>

                        {/* 3. Liste des Domaines Bloqués Récemment */}
                        <View style={screenStyles.sectionContainer}>
                            <Text style={screenStyles.sectionTitle}>Top 5 des domaines bloqués</Text>
                            
                            {stats.blockedDomains.map((domain, index) => (
                                <BlockedDomainItem 
                                    key={domain.name} 
                                    domainName={domain.name}
                                    count={domain.count}
                                    isLast={index === stats.blockedDomains.length - 1}
                                />
                            ))}
                        </View>
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

// Styles statiques (non dépendants du thème)
const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
});

export default StatsScreen;