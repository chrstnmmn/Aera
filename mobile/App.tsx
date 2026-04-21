import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Import our organized Setup component
import Setup from './Setup';

// Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Handle potential error in some environments */
});

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        // Simulate a 3-second load for the Aera brand experience
        // This provides a professional transition to the logo screen
        await new Promise(resolve => setTimeout(resolve, 3000)); 
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        // Once preparation is done, hide the native splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      {/* The Setup component handles the centered Aera logo 
          and switches themes automatically.
      */}
      <Setup />
      
      {/* Adaptive status bar (detects light/dark system theme) */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color is managed by Setup.tsx to prevent flickering
  },
});