// src/components/SimpleBarChart.tsx
import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useAppTheme } from '../theme/ThemeContext';

const CHART_WIDTH = Dimensions.get('window').width - 60; // Largeur pour l'espace intérieur
const MAX_HEIGHT = 150;

// Reçoit les données réelles (bloqué vs autorisé) du contexte
const SimpleBarChart = ({ data }: { data: { blocked: number, allowed: number } }) => {
  const { theme } = useAppTheme();
  
  const totalRequests = data.blocked + data.allowed;
  
  // Calcul des pourcentages
  const blockedRatio = totalRequests > 0 ? data.blocked / totalRequests : 0;
  const allowedRatio = totalRequests > 0 ? data.allowed / totalRequests : 0;
  
  // Hauteurs des barres
  const blockedHeight = blockedRatio * MAX_HEIGHT;
  const allowedHeight = allowedRatio * MAX_HEIGHT;

  // Si l'activité est faible, on affiche une barre minimum pour qu'elle soit visible
  const minHeight = totalRequests > 0 ? 5 : 0;

  return (
    <View style={styles.chartWrapper}>
      <Svg height={MAX_HEIGHT + 20} width={CHART_WIDTH}>
        
        {/* Barre Bloquée */}
        <Rect
          x={CHART_WIDTH / 4 - 25}
          y={MAX_HEIGHT - blockedHeight}
          width={50}
          height={Math.max(blockedHeight, minHeight)}
          fill={theme.error}
          rx={4} 
        />
        
        {/* Barre Autorisée */}
        <Rect
          x={(CHART_WIDTH / 4) * 3 - 25}
          y={MAX_HEIGHT - allowedHeight}
          width={50}
          height={Math.max(allowedHeight, minHeight)}
          fill={theme.success}
          rx={4} 
        />
        
        {/* Ligne de base (Axe X) */}
        <Rect x="0" y={MAX_HEIGHT} width={CHART_WIDTH} height="2" fill={theme.separator} /> 
      </Svg>
      
      {/* Étiquettes X et Valeurs */}
      <View style={styles.labelsContainer}>
        <View style={styles.labelGroup}>
            <Text style={[styles.label, { color: theme.error }]}>Bloqué</Text>
            <Text style={[styles.value, { color: theme.error }]}>{data.blocked.toLocaleString('fr-FR')}</Text>
        </View>
        <View style={styles.labelGroup}>
            <Text style={[styles.label, { color: theme.success }]}>Autorisé</Text>
            <Text style={[styles.value, { color: theme.success }]}>{data.allowed.toLocaleString('fr-FR')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    alignItems: 'center',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  labelGroup: {
    alignItems: 'center',
    width: CHART_WIDTH / 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  }
});

export default SimpleBarChart;