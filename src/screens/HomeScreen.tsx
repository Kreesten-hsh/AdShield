// src/screens/HomeScreen.tsx

import React from 'react';
import { 
  SafeAreaView, StyleSheet, View, StatusBar, Text 
} from 'react-native';
import ShieldStatusCard from '../components/ShieldStatusCard'; 
import { useAppTheme } from '../theme/ThemeContext';
import { useShield } from '../context/ShieldContext'; // Lecture de l'état persistant

type HomeScreenProps = { navigation: any; };

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { theme, isDarkMode } = useAppTheme();
  // 🚨 Lecture de l'état persistant et de la fonction toggle
  const { isShieldActive, toggleShield } = useShield(); 
  
  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, },
    mainContent: { flex: 1, paddingHorizontal: 20, alignItems: 'center', paddingTop: 50, },
    header: { padding: 18, alignItems: 'center', backgroundColor: theme.background, },
    headerText: { color: theme.textPrimary, fontSize: 25, fontWeight: 'bold', paddingTop: 25, },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerText}>AdShield</Text>
      </View>

      <View style={dynamicStyles.mainContent}>
        {/* Les props viennent du contexte persistant */}
        <ShieldStatusCard 
          isActive={isShieldActive} 
          toggleShield={toggleShield} 
        />
      </View>
    </SafeAreaView>
  );
};
export default HomeScreen;