/**
 * Écran Mot de passe oublié — Figma écran 3/31
 * Titre "Mot de passe oublié ?", texte explicatif,
 * champ email, bouton "Recevoir le lien", lien retour
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants';
import { InputField, PrimaryButton } from '../components/ui';
import { RootStackParamList } from '../types';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');

  const handleSendLink = () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email.');
      return;
    }
    Alert.alert(
      'Lien envoyé',
      `Un lien de réinitialisation a été envoyé à ${email} (simulé).`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Titre */}
          <Text style={styles.title}>Mot de passe oublié ?</Text>

          {/* Texte explicatif */}
          <Text style={styles.description}>
            Veuillez saisir votre e-mail de connexion afin de recevoir le lien de réinitialisation de
            votre mot de passe.
          </Text>

          {/* Champ email */}
          <InputField
            label="Email"
            placeholder="exemple@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Bouton */}
          <PrimaryButton
            title="Recevoir le lien"
            onPress={handleSendLink}
            style={styles.button}
          />

          {/* Lien retour */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Retour à la page de connexion</Text>
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
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
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
});
