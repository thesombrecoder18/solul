/**
 * Écran Commande Confirmée — Figma écran 15/31
 * Check vert, "Le compte est bon {nom}!", numéro de commande,
 * bouton "Télécharger le reçu"
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { RootStackParamList, User } from '../types';
import { authService, cartService } from '../services';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OrderConfirmedScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderConfirmed'>>();
  const { commandeId, montant } = route.params;
  const [userName, setUserName] = useState('');

  useEffect(() => {
    (async () => {
      const u = await authService.getCurrentUser();
      if (u) setUserName(u.prenom);
      // Déplacer les articles du panier vers "achetés"
      await cartService.moveCartToPurchased();
    })();
  }, []);

  const handleClose = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleDownload = () => {
    Alert.alert('Téléchargement', 'Le reçu a été téléchargé (simulé).');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande confirmée</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Check icon */}
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={60} color={Colors.textLight} />
        </View>

        <Text style={styles.mainTitle}>
          Le compte est bon {userName} !
        </Text>
        <Text style={styles.subtitle}>
          Nous espérons que vous recevrez votre article d'ici peu
        </Text>

        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Commande</Text>
          <Text style={styles.orderId}>{commandeId}</Text>
        </View>

        <Text style={styles.montant}>{montant.toLocaleString('fr-FR')} fcfa</Text>

        {/* Bouton téléchargement */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
          <Text style={styles.downloadBtnText}>Télécharger le reçu</Text>
        </TouchableOpacity>

        {/* Bouton laisser un avis */}
        <TouchableOpacity
          style={styles.avisBtn}
          onPress={() => navigation.navigate('Reviews', { userId: 'user1' })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
          <Text style={styles.avisBtnText}>Laisser un avis</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  mainTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  orderIdLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  orderId: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  montant: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  avisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: BorderRadius.xl,
    gap: 8,
    marginTop: Spacing.md,
    width: '100%',
  },
  avisBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  downloadBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
});
