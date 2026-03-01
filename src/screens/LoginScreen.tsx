/**
 * Écran de connexion — Figma écran 2/31
 * Titre "Connectez-vous !", champs email + mdp, bouton doré,
 * liens mot de passe oublié / inscription, séparateur OU,
 * boutons sociaux (Google, Facebook, Apple), texte légal
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
import { Colors, FontSize, Spacing } from '../constants';
import { InputField, PrimaryButton, SocialButton } from '../components/ui';
import { authService } from '../services';
import { RootStackParamList } from '../types';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !motDePasse.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(email.trim(), motDePasse);
      if (user) {
        // Navigation vers l'écran principal (à implémenter)
        Alert.alert('Succès', `Bienvenue ${user.prenom} !`);
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Info', `Connexion via ${provider} — fonctionnalité simulée.`);
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
          <Text style={styles.title}>Connectez-vous !</Text>

          {/* Champs */}
          <InputField
            label="Email ou nom d'utilisateur"
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
          />

          {/* Bouton Se connecter */}
          <PrimaryButton
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Mot de passe oublié */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Lien inscription */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkUnderline}>
              Vous n'avez pas de compte? Inscrivez vous !
            </Text>
          </TouchableOpacity>

          {/* Séparateur OU */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OU</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Boutons sociaux */}
          <SocialButton provider="google" onPress={() => handleSocialLogin('Google')} />
          <SocialButton provider="facebook" onPress={() => handleSocialLogin('Facebook')} />
          <SocialButton provider="apple" onPress={() => handleSocialLogin('Apple')} />

          {/* Texte légal */}
          <Text style={styles.legalText}>
            En cliquant sur Se connecter, Continuer avec Google, Facebook ou Apple, vous acceptez les{' '}
            <Text style={styles.legalLink}>Conditions d'utilisation</Text> et la{' '}
            <Text style={styles.legalLink}>Politique de confidentialité</Text> de Solul.
          </Text>

          <Text style={styles.legalText}>
            Solul peut vous envoyer des communications ; vous pouvez modifier vos préférences dans les
            paramètres de votre compte. Nous ne publierons jamais rien sans votre autorisation.
          </Text>
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
  loginButton: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  linkUnderline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
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
  legalText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.md,
  },
  legalLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
