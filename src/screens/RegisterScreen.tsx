/**
 * Écran Inscription — Figma écran 4-5/31
 * Titre "Création d'un compte", boutons sociaux en haut,
 * séparateur OU, champs (nom d'utilisateur, email, mot de passe),
 * checkbox CGU, bouton "Continuer"
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { InputField, PrimaryButton, SocialButton } from '../components/ui';
import { RootStackParamList } from '../types';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [acceptConditions, setAcceptConditions] = useState(false);

  const validatePassword = (pwd: string): boolean => {
    // Au moins 7 caractères, 1 lettre et 1 chiffre
    return pwd.length >= 7 && /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleContinue = () => {
    if (!nomUtilisateur.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom d\'utilisateur.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email.');
      return;
    }
    if (!validatePassword(motDePasse)) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 7 caractères, dont 1 lettre et 1 chiffre.');
      return;
    }
    if (!acceptConditions) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation.');
      return;
    }

    // Naviguer vers l'écran de vérification avec les données
    navigation.navigate('Verification', {
      nomUtilisateur: nomUtilisateur.trim(),
      email: email.trim(),
      motDePasse,
    });
  };

  const handleSocialRegister = (provider: string) => {
    Alert.alert('Info', `Inscription via ${provider} — fonctionnalité simulée.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Titre */}
          <Text style={styles.title}>Création d'un compte</Text>

          {/* Boutons sociaux */}
          <SocialButton provider="google" onPress={() => handleSocialRegister('Google')} />
          <SocialButton provider="facebook" onPress={() => handleSocialRegister('Facebook')} />
          <SocialButton provider="apple" onPress={() => handleSocialRegister('Apple')} />

          {/* Séparateur OU */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OU</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Champs */}
          <InputField
            label="Nom d'utilisateur"
            placeholder="Binta"
            value={nomUtilisateur}
            onChangeText={setNomUtilisateur}
            autoCapitalize="none"
            helperText="Utilise des lettres, des chiffres ou les deux. Les autres membres Solul verront ce nom sur ton compte."
          />

          <InputField
            label="Email"
            placeholder="exemple@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Mot de passe"
            placeholder="************"
            value={motDePasse}
            onChangeText={setMotDePasse}
            secureTextEntry
            helperText="Saisis au moins 7 caractères, dont au moins 1 lettre et 1 chiffre"
          />

          {/* Checkbox CGU */}
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, acceptConditions && styles.checkboxChecked]}
              onPress={() => setAcceptConditions(!acceptConditions)}
            >
              {acceptConditions && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              En t'inscrivant, tu confirmes que tu acceptes les{' '}
              <Text style={styles.checkboxLink}>Termes & Conditions</Text> de Solul, avoir lu la{' '}
              <Text style={styles.checkboxLink}>Politique de confidentialité</Text> et avoir au moins
              18 ans.
            </Text>
          </View>

          {/* Bouton Continuer */}
          <PrimaryButton
            title="Continuer"
            onPress={handleContinue}
            disabled={!acceptConditions}
            style={styles.continueButton}
          />

          {/* Lien vers connexion */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLinkContainer}
          >
            <Text style={styles.loginLinkText}>
              Vous avez déjà un compte ?{' '}
              <Text style={styles.loginLinkBold}>Connectez-vous</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    fontStyle: 'italic',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 3,
    marginRight: Spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  checkboxLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xl,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginLinkText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
