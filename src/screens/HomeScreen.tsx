// src/screens/HomeScreen.tsx

import React from 'react';
import { 
  SafeAreaView, StyleSheet, View, StatusBar, Text 
} from 'react-native';
import ShieldStatusCard from '../components/ShieldArea'; 
import { useAppTheme } from '../theme/ThemeContext';
import { useShield } from '../context/ShieldContext'; 

type HomeScreenProps = { navigation: any; };

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { theme, isDarkMode } = useAppTheme();
  
  useShield(); // Ensure hook usage for context

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, },
    mainContent: { flex: 1, paddingHorizontal: 20, alignItems: 'center', paddingTop: 50, },
    header: { padding: 18, alignItems: 'center', backgroundColor: theme.background, },
    headerText: { color: theme.textPrimary, fontSize: 28, fontWeight: '900', paddingTop: 25, letterSpacing: 1.2 },
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
        <ShieldStatusCard />
      </View>
    </SafeAreaView>
  );
};
export default HomeScreen;
