/**
 * Écran Splash — Affiché au lancement de l'app
 * Fond beige, logo SOLUL centré avec ornement, slogan en italique
 * Redirige automatiquement vers Login après 2.5s
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Ornement décoratif au-dessus du logo */}
      <Text style={styles.ornament}>❧</Text>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerLine} />
      </View>

      {/* Logo */}
      <Text style={styles.logo}>SOLUL</Text>

      {/* Ligne sous le logo */}
      <View style={styles.underline} />

      {/* Slogan */}
      <Text style={styles.slogan}>une tenue, plusieurs vies</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ornament: {
    fontSize: 36,
    color: Colors.primary,
    marginBottom: -2,
    transform: [{ rotate: '0deg' }],
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    marginBottom: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.primary,
  },
  logo: {
    fontSize: 48,
    fontWeight: '400',
    color: Colors.primary,
    letterSpacing: 8,
    fontFamily: undefined, // Sera remplacé par la police Figma si fournie
  },
  underline: {
    width: 220,
    height: 1.5,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  slogan: {
    fontSize: 15,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: 6,
    letterSpacing: 1,
  },
});
