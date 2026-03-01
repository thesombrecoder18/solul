/**
 * Composant bouton social (Google, Facebook, Apple)
 * Bouton avec bordure, icône centrée
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants';

type SocialProvider = 'google' | 'facebook' | 'apple';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const providerConfig: Record<SocialProvider, { icon: string; color: string }> = {
  google: { icon: 'G', color: '#DB4437' },
  facebook: { icon: 'f', color: '#1877F2' },
  apple: { icon: '', color: '#000000' },
};

export default function SocialButton({ provider, onPress }: SocialButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      {provider === 'google' && (
        <Text style={[styles.iconText, { color: config.color, fontWeight: '700', fontSize: 20 }]}>G</Text>
      )}
      {provider === 'facebook' && (
        <Ionicons name="logo-facebook" size={24} color={config.color} />
      )}
      {provider === 'apple' && (
        <Ionicons name="logo-apple" size={24} color={config.color} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
  },
});
