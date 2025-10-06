import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    SafeAreaView, Text, StyleSheet, View, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Platform 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAppTheme } from '../theme/ThemeContext'; 

const { width } = Dimensions.get('window');

// --- 1. Définition des types et des données initiales ---

type DomainStat = { name: string; count: number };
type Stats = {
    totalBlocked: string;
    totalDataSaved: string;
    blockedDomains: DomainStat[];
    dailyBlocks: number[]; // Donnée pour le graphique
};

const initialMockStats: Stats = {
    totalBlocked: '0',
    totalDataSaved: '0.00 GB',
    blockedDomains: [],
    dailyBlocks: [0, 0, 0, 0, 0, 0, 0], 
};

// --- 2. Hook Fonctionnel pour la Simulation et la Réinitialisation ---

const useStatsData = () => {
    const [stats, setStats] = useState<Stats>(initialMockStats);
    const [baseBlocked, setBaseBlocked] = useState(0); 
    const [isLoading, setIsLoading] = useState(true);

    const generateDailyData = () => {
        return [
            Math.floor(Math.random() * 200) + 100,
            Math.floor(Math.random() * 250) + 150,
            Math.floor(Math.random() * 180) + 120,
            Math.floor(Math.random() * 300) + 200,
            Math.floor(Math.random() * 220) + 140,
            Math.floor(Math.random() * 100) + 50,
            Math.floor(Math.random() * 80) + 30
        ];
    };

    const generateMockStats = useCallback((currentBase: number) => {
        if (currentBase === 0) {
            currentBase = Math.floor(Math.random() * 500) + 100;
        }

        const totalBlocked = currentBase + Math.floor(Math.random() * 2000) + 500; 
        const totalDataSavedGB = (totalBlocked * 0.000007).toFixed(2); 

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
                dailyBlocks: generateDailyData(),
            },
            newBaseBlocked: totalBlocked
        };
    }, []);

    const updateStats = useCallback(() => {
        const { stats, newBaseBlocked } = generateMockStats(baseBlocked);
        setStats(stats);
        setBaseBlocked(newBaseBlocked);
    }, [baseBlocked, generateMockStats]);

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

// --- 3. Composant BarChartMockup (Graphique Dynamique) ---

interface BarChartMockupProps {
    data: number[];
}

const BarChartMockup: React.FC<BarChartMockupProps> = ({ data }) => {
    const { theme } = useAppTheme();
    
    const maxBlocks = Math.max(...data) || 100; 
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        // Utilisation du style sectionContainer pour l'alignement
        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, marginBottom: 20, padding: 15 }]}>
            <Text style={[chartStyles.chartTitle, { color: theme.textPrimary }]}>Activité Hebdomadaire</Text>
            
            <View style={chartStyles.chartContainer}>
                {data.map((blockCount, index) => {
                    const height = (blockCount / maxBlocks) * 85 + 5; 

                    return (
                        <View key={index} style={chartStyles.barWrapper}>
                            <View style={[chartStyles.bar, { 
                                height: height, 
                                backgroundColor: theme.primary,
                            }]} />
                            <Text style={[chartStyles.label, { color: theme.textSecondary }]}>{labels[index]}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const chartStyles = StyleSheet.create({
    // Suppression de marginHorizontal: 15 et utilisation du style sectionContainer
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        paddingHorizontal: 0, // Assurer que le titre est aligné avec le contenu
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 120,
        paddingHorizontal: 5,
    },
    barWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 25,
        borderRadius: 4,
    },
    label: {
        fontSize: 12,
        marginTop: 5,
    },
});


// --- 4. Composants d'affichage (StatCard et BlockedDomainItem) ---

type CardProps = { title: string, value: string, iconName: string };

const StatCard = ({ title, value, iconName }: CardProps) => {
    const { theme } = useAppTheme(); 
    
    return (
        <View style={[styles.statCardStyle, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitleStyle, { color: theme.textSecondary }]}>{title}</Text>
            <Text style={[styles.cardValueStyle, { color: theme.textPrimary }]}>{value}</Text>
            <Ionicons name={iconName} size={24} color={theme.primary} style={[styles.cardIconStyle, { opacity: 0.3 }]} />
        </View>
    );
};

type DomainItemProps = { domainName: string, count: number, isLast: boolean };

const BlockedDomainItem = ({ domainName, count, isLast }: DomainItemProps) => {
    const { theme } = useAppTheme();

    return (
        <View style={[styles.domainItemStyle, { borderBottomColor: theme.separator, borderBottomWidth: isLast ? 0 : 1 }]}>
            <View style={styles.leftContainerStyle}> 
                <Ionicons name="lock-closed" size={16} color={theme.error} />
                <Text style={[styles.domainTextStyle, { color: theme.textPrimary }]}>{domainName}</Text>
            </View>
            <Text style={[styles.countTextStyle, { color: theme.textSecondary }]}>{count.toLocaleString('fr-FR')}</Text>
        </View>
    );
};


// --- 5. Écran principal des Statistiques (FINAL) ---

const StatsScreen: React.FC = () => {
    const { theme } = useAppTheme();
    const { stats, isLoading, resetStats, hasStats } = useStatsData();
    
    const isDarkMode = theme.textPrimary === '#FFFFFF' || theme.textPrimary === '#FFF'; 

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Chargement des statistiques...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.cardBackground} />
            
            {/* Header AVEC BOUTON DE RÉINITIALISATION */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.separator }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Statistiques</Text>
                    <TouchableOpacity 
                        onPress={resetStats} 
                        style={[styles.resetButton, { backgroundColor: hasStats ? theme.error : theme.separator, opacity: hasStats ? 1 : 0.5 }]}
                        disabled={!hasStats}
                    >
                        <Ionicons name="trash-outline" size={20} color={theme.background} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                {/* État Vide */}
                {!hasStats && (
                    <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
                        <Ionicons name="stats-chart-outline" size={40} color={theme.primary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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

                        {/* 2. Graphique DYNAMIQUE */}
                        <BarChartMockup data={stats.dailyBlocks} /> 

                        {/* 3. Liste des Domaines Bloqués Récemment */}
                        <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground }]}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Top {stats.blockedDomains.length} des domaines bloqués</Text>
                            
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

// Styles statiques pour la robustesse des petits composants
const styles = StyleSheet.create({
    container: { flex: 1 },
    
    // Header
    header: { padding: 15, borderBottomWidth: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 0 : 25 },
    headerTitle: { fontSize: 26, fontWeight: 'bold' , paddingTop: 30, },
    resetButton: { padding: 8, borderRadius: 20, marginTop: 27, },

    // ScrollView
    scrollViewContent: { padding: 15, paddingBottom: 80 }, 
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    // Sections communes
    sectionContainer: {
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal:20 ,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, },
    
    // État vide
    emptyState: { 
        padding: 30, 
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 20,
    },
    emptyText: { marginTop: 10, textAlign: 'center' },

    // StatCard Styles
    statCardStyle: {
        width: (width / 2) - 25,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    cardTitleStyle: { fontSize: 14, marginBottom: 5, },
    cardValueStyle: { fontSize: 24, fontWeight: '900', },
    cardIconStyle: { position: 'absolute', top: 15, right: 15 },

    // BlockedDomainItem Styles
    domainItemStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 12,
    },
    leftContainerStyle: { flexDirection: 'row', alignItems: 'center' },
    domainTextStyle: { fontSize: 15, fontWeight: '500', marginLeft: 8 },
    countTextStyle: { fontSize: 15, fontWeight: '600' },
});

export default StatsScreen;