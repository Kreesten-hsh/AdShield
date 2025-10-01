// src/components/ShieldStatusCard.tsx (Mise à jour pour ThemeContext)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext'; // 🚨 Utilisation du contexte

interface ShieldStatusCardProps {
  isActive: boolean;
  toggleShield: () => void;
}

const ShieldStatusCard = ({ isActive, toggleShield }: ShieldStatusCardProps) => {
  // 🚨 Récupération du thème ici
  const { theme } = useAppTheme(); 

  // Couleurs et textes conditionnels
  const statusIcon = isActive ? '🛡️' : '🔒';
  const mainStatusText = isActive ? 'Protection Active' : 'Protection Désactivée';
  const buttonText = isActive ? 'Désactiver' : 'Activer';

  const dynamicStyles = StyleSheet.create({
    // ... (Styles du ShieldStatusCard, mis à jour pour utiliser theme.shieldAreaBg, theme.textPrimary, etc.)
    // ... [Note: Tous les styles doivent être mis à jour comme dans l'exemple précédent pour utiliser la variable 'theme']
    content: { alignItems: 'center', justifyContent: 'flex-start', },
    shieldArea: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 30, backgroundColor: theme.shieldAreaBg, },
    mainShield: { fontSize: 90, },
    mainStatusText: { fontSize: 28, fontWeight: 'bold', color: theme.shieldText, marginBottom: 40, },
    dailyStats: { alignItems: 'center', marginBottom: 50, },
    dailyStatsText: { fontSize: 16, color: theme.textSecondary, lineHeight: 25, },
    dailyStatsNumber: { fontWeight: 'bold', color: theme.textPrimary, },
    mainButton: { width: 300, paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, backgroundColor: isActive ? theme.success : theme.error, },
    mainButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', },
  });


  return (
    <View style={dynamicStyles.content}>
        {/* ... JSX du composant ... */}
        <View style={dynamicStyles.shieldArea}><Text style={dynamicStyles.mainShield}>{statusIcon}</Text></View>
        <Text style={dynamicStyles.mainStatusText}>{mainStatusText}</Text>
        <View style={dynamicStyles.dailyStats}>
            <Text style={dynamicStyles.dailyStatsText}>Aujourd'hui: <Text style={dynamicStyles.dailyStatsNumber}>1,245</Text> pubs bloquées</Text>
            <Text style={dynamicStyles.dailyStatsText}><Text style={dynamicStyles.dailyStatsNumber}>2.3 MB</Text> de données économisées</Text>
        </View>
        <TouchableOpacity style={dynamicStyles.mainButton} onPress={toggleShield}>
            <Text style={dynamicStyles.mainButtonText}>{buttonText}</Text>
        </TouchableOpacity>
    </View>
  );
};

export default ShieldStatusCard;