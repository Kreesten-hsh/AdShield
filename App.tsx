// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { ShieldProvider } from './src/context/ShieldContext';

const App = () => {
  return (
    <ShieldProvider>
        <ThemeProvider>
            <NavigationContainer>
                <TabNavigator />
            </NavigationContainer>
        </ThemeProvider>
    </ShieldProvider>
  );
};

export default App;