/**
 * Écran Paiement — Figma écran 14/31
 * Détails commande, récapitulatif, modes de paiement (Wave, Orange Money)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { CartItem, Product, RootStackParamList, User } from '../types';
import { cartService, authService } from '../services';
import { fakeProducts, fakeUsers } from '../data';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Payment'>>();
  const cartItems = route.params.items;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'wave' | 'orange_money' | null>(null);

  useEffect(() => {
    (async () => {
      const u = await authService.getCurrentUser();
      setCurrentUser(u);
    })();
  }, []);

  // Enrichir les articles avec les données produit
  const enrichedItems = cartItems
    .map((ci) => {
      const product = fakeProducts.find((p) => p.id === ci.produitId);
      return product ? { ...ci, product } : null;
    })
    .filter(Boolean) as (CartItem & { product: Product })[];

  const sousTotal = enrichedItems.reduce((sum, item) => {
    const price = item.type === 'location'
      ? (item.product.prixLocation || item.product.prix)
      : item.product.prix;
    return sum + price * item.quantite;
  }, 0);
  const total = sousTotal; // pas de frais de livraison dans le MVP

  const handleContinue = async () => {
    if (!selectedPayment) {
      Alert.alert('Paiement', 'Veuillez choisir un mode de paiement.');
      return;
    }
    // Simuler le paiement
    const commandeId = `#${Math.floor(1000000 + Math.random() * 9000000)}`;
    await cartService.clearCart();
    navigation.navigate('OrderConfirmed', { commandeId, montant: total });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details de la commande</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Pseudo" value={currentUser ? `${currentUser.prenom}` : '—'} />
            <DetailRow label="Addresse" value={currentUser?.localisation || '—'} />
            <DetailRow label="Numéro" value={currentUser?.telephone || '—'} />
            <DetailRow label="Type" value={enrichedItems[0]?.type === 'location' ? 'Location' : 'Vente'} />
          </View>
        </View>

        {/* Récapitulatif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif de la commande</Text>
          {enrichedItems.map((item) => (
            <View key={item.produitId} style={styles.recapItem}>
              <Image source={{ uri: item.product.images[0] }} style={styles.recapImage} />
              <View style={styles.recapInfo}>
                <Text style={styles.recapTitle} numberOfLines={2}>{item.product.titre}</Text>
                <Text style={styles.recapPrice}>
                  {(item.type === 'location'
                    ? item.product.prixLocation || item.product.prix
                    : item.product.prix
                  ).toLocaleString('fr-FR')}{' '}
                  fcfa
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Soustotal</Text>
            <Text style={styles.totalValue}>{sousTotal.toLocaleString('fr-FR')} fcfa</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelBold}>Total</Text>
            <Text style={styles.totalValueBold}>{total.toLocaleString('fr-FR')} fcfa</Text>
          </View>
        </View>

        {/* Modes de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modes de paiement</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, selectedPayment === 'wave' && styles.paymentSelected]}
              onPress={() => setSelectedPayment('wave')}
            >
              <View style={styles.paymentLogo}>
                <Ionicons name="wallet-outline" size={28} color="#1DC3E0" />
              </View>
              <Text style={styles.paymentName}>Wave</Text>
              {selectedPayment === 'wave' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} style={styles.paymentCheck} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentOption, selectedPayment === 'orange_money' && styles.paymentSelected]}
              onPress={() => setSelectedPayment('orange_money')}
            >
              <View style={styles.paymentLogo}>
                <Ionicons name="phone-portrait-outline" size={28} color="#FF6600" />
              </View>
              <Text style={styles.paymentName}>Orange Money</Text>
              {selectedPayment === 'orange_money' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} style={styles.paymentCheck} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bouton Continuer */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  backBtn: {
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
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  recapImage: {
    width: 60,
    height: 70,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  recapInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  recapTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recapPrice: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  totalLabelBold: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValueBold: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentSelected: {
    borderColor: Colors.primary,
  },
  paymentLogo: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  paymentName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundWhite,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: Colors.textLight,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
