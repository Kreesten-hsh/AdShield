import React from 'react';
import { SafeAreaView, Text } from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green' }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white' }}>
        AdShield est en ligne !
      </Text>
    </SafeAreaView>
  );
}
export default App;