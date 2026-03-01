/**
 * Écran Vérification du code — Figma écran 6/31
 * Titre "Création d'un compte", sous-titre "Saisir le code de vérification",
 * champ code, bouton "Vérifier", lien "Renvoyer le code"
 * Après vérification : création du compte en local + redirection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors, FontSize, Spacing } from '../constants';
import { InputField, PrimaryButton } from '../components/ui';
import { authService } from '../services';
import { RootStackParamList } from '../types';

type VerificationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Verification'>;
  route: RouteProp<RootStackParamList, 'Verification'>;
};

// Code de vérification simulé
const FAKE_CODE = '123456';

export default function VerificationScreen({ navigation, route }: VerificationScreenProps) {
  const { nomUtilisateur, email, motDePasse } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    // Simulation : on accepte n'importe quoi, pas de vérification réelle
    setLoading(true);
    try {
      const user = await authService.register({
        nom: nomUtilisateur,
        prenom: '',
        email,
        telephone: '',
        motDePasse,
        photoProfil: '',
        localisation: 'Dakar',
        type: 'particulier',
      });

      if (user) {
        // Redirige directement vers l'accueil (MainTabs)
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert('Erreur', 'Cet email est déjà utilisé.');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Code renvoyé', `Un nouveau code a été envoyé à ${email} (simulé). Code : ${FAKE_CODE}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Titre */}
          <Text style={styles.title}>Création d'un compte</Text>

          {/* Sous-titre */}
          <Text style={styles.subtitle}>Saisir le code de vérification</Text>

          {/* Champ code */}
          <InputField
            label=""
            placeholder="************"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoCapitalize="none"
          />

          {/* Bouton Vérifier */}
          <PrimaryButton
            title="Vérifier"
            onPress={handleVerify}
            loading={loading}
            style={styles.button}
          />

          {/* Lien renvoyer */}
          <TouchableOpacity onPress={handleResendCode} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Tu n'as pas reçu de code?{' '}
              <Text style={styles.linkBold}>Renvoyer le code</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  linkContainer: {
    marginTop: Spacing.lg,
  },
  linkText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  linkBold: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
