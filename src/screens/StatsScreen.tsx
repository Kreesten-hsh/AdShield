import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, Text, StyleSheet, View, ScrollView, StatusBar, TouchableOpacity // Import de TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useAppTheme } from '../theme/ThemeContext'; 

// --- 1. Simulation de données et Logique de mise à jour ---

// Fonction pour générer des données statistiques réalistes (fausses)
const generateMockStats = () => {
    // Génère un nombre total bloqué aléatoire (entre 10,000 et 100,000)
    const totalBlocked = Math.floor(Math.random() * 90000) + 10000; 
    // Génère des données économisées aléatoires (entre 0.5 et 2.0 GB)
    const totalDataSavedGB = (Math.random() * 1.5 + 0.5).toFixed(2); 

    const recentDomains = [
        'facebook.com', 'googleadservices.com', 'doubleclick.net', 'analytics.com', 
        'tracking.io', 'pixel.xyz', 'metrics.net', 'adserver.com', 'tracking-pixel.com'
    ];
    // Prend un sous-ensemble aléatoire de 4 domaines
    const blockedDomains = recentDomains
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 4);

    return {
        totalBlocked: totalBlocked.toLocaleString('fr-FR'), // Utiliser la locale pour les séparateurs
        totalDataSaved: `${totalDataSavedGB} GB`,
        blockedDomains,
    };
};

// Hook personnalisé pour gérer et mettre à jour les fausses données
const useStatsData = () => {
    const [stats, setStats] = useState(generateMockStats());

    // Effet pour mettre à jour les statistiques toutes les 30 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(generateMockStats());
        }, 30000); 

        return () => clearInterval(interval);
    }, []);

    return stats;
};

// --- 2. Composants d'affichage (Simples) ---

const StatCard = ({ title, value, iconName }: { title: string, value: string, iconName: string }) => {
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

const BlockedDomainItem = ({ domain, isLast }: { domain: string, isLast: boolean }) => {
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
    domainText: { fontSize: 15, color: theme.textPrimary, fontWeight: '500', },
  });

  return (
    <View style={domainStyles.domainItem}>
      <Text style={domainStyles.domainText}>{domain}</Text>
      <Ionicons name="lock-closed" size={16} color={theme.textSecondary} />
    </View>
  );
};


/**
 * Écran principal des Statistiques
 */
const StatsScreen = () => {
  const { theme } = useAppTheme();
  const isDarkMode = false; // Placeholder, since theme doesn't have it
  const stats = useStatsData();

  // 🚨 DÉFINITION COMPLÈTE des styles dynamiques
  const screenStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, },
    header: { padding: 15, backgroundColor: theme.cardBackground, borderBottomWidth: 1, borderBottomColor: theme.separator, },
    headerTitle: { fontSize: 25, fontWeight: 'bold', color: theme.textPrimary, textAlign: 'center', paddingTop: 25, },
    scrollViewContent: { padding: 15, },
    
    chartContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
    },
    chartTitle: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 10, },
    chartPlaceholder: {
      height: 150,
      backgroundColor: theme.separator, 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.primary,
      opacity: 0.7,
    },
    recentDomainsContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 5,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
    },
    recentDomainsTitle: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 10, },
  });


  return (
    <SafeAreaView style={screenStyles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      <View style={screenStyles.header}>
        <Text style={screenStyles.headerTitle}>Statistiques</Text>
      </View>

      <ScrollView contentContainerStyle={screenStyles.scrollViewContent}>
        
        {/* 1. Cartes de Synthèse (Valeurs dynamiques) */}
        <View style={styles.summaryContainer}>
          <StatCard title="Total bloqué" value={stats.totalBlocked} iconName="shield-outline" />
          <StatCard title="Données économisées" value={stats.totalDataSaved} iconName="cloud-download-outline" />
        </View>

        {/* 2. Graphique */}
        <View style={screenStyles.chartContainer}>
          <Text style={screenStyles.chartTitle}>Activité des 7 derniers jours</Text>
          <View style={screenStyles.chartPlaceholder} />
        </View>

        {/* 3. Liste des Domaines Bloqués Récemment (Valeurs dynamiques) */}
        <View style={screenStyles.recentDomainsContainer}>
          <Text style={screenStyles.recentDomainsTitle}>Domaines bloqués récemment</Text>
          
          {/* Mappage des données simulées */}
          {stats.blockedDomains.map((domain, index) => (
            <BlockedDomainItem 
                key={domain} 
                domain={domain} 
                isLast={index === stats.blockedDomains.length - 1}
            />
          ))}

        </View>

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