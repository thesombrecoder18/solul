/**
 * Écran Panier — Figma écrans 12-13/31
 * "Mon panier" avec liste d'articles, confirmation d'acquisition,
 * bouton "Validation et paiement"
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { CartItem, Product, RootStackParamList } from '../types';
import { cartService, storageService } from '../services';
import { productService } from '../services/productService';
import { fakeProducts, fakeUsers } from '../data';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CartItemFull extends CartItem {
  product: Product;
}

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<CartItemFull[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<CartItemFull[]>([]);
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set());

  // Résoudre un produit par ID : d'abord fakeProducts, sinon storageService
  const resolveProduct = async (produitId: string): Promise<Product | null> => {
    const fromFake = fakeProducts.find((p) => p.id === produitId);
    if (fromFake) return fromFake;
    // Chercher dans les produits stockés (publiés dynamiquement)
    const allProducts = await productService.getAll();
    return allProducts.find((p) => p.id === produitId) || null;
  };

  const loadCart = async () => {
    const cart = await cartService.getCart();
    const fullPromises = cart.map(async (ci) => {
      const product = await resolveProduct(ci.produitId);
      return product ? { ...ci, product } : null;
    });
    const fullResults = await Promise.all(fullPromises);
    setItems(fullResults.filter(Boolean) as CartItemFull[]);

    // Charger les articles achetés en attente de confirmation
    const purchased = await cartService.getPurchasedItems();
    const purchasedPromises = purchased.map(async (ci) => {
      const product = await resolveProduct(ci.produitId);
      return product ? { ...ci, product } : null;
    });
    const purchasedResults = await Promise.all(purchasedPromises);
    setPurchasedItems(purchasedResults.filter(Boolean) as CartItemFull[]);
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const removeItem = async (produitId: string) => {
    await cartService.removeItem(produitId);
    loadCart();
  };

  const markReceived = async (produitId: string) => {
    setConfirmedItems((prev) => new Set(prev).add(produitId));
    await cartService.confirmReceived(produitId);
    Alert.alert('Merci !', 'Commande confirmée comme reçue.');
    // Recharger pour mettre à jour la liste
    setTimeout(() => loadCart(), 1500);
  };

  const getMatiere = (product: Product): string => {
    if (product.categorie === 'Robes' && product.genre === 'Enfant') return 'Matière: getzner';
    if (product.titre.includes('Boubou') && product.genre === 'Femme') return 'Matière:Brocart,soie...';
    if (product.titre.includes('sirène')) return 'Matière:Organza,dent...';
    if (product.titre.includes('Demi-boubou')) return 'Matière:Bazin riche';
    return 'Matière: tissu';
  };

  const getPrix = (ci: CartItemFull): string => {
    if (ci.type === 'location') {
      return `${(ci.product.prixLocation || ci.product.prix).toLocaleString('fr-FR')}  fcfa / jour`;
    }
    return `${ci.product.prix.toLocaleString('fr-FR')}  fcfa`;
  };

  const renderCartItem = ({ item }: { item: CartItemFull }) => {
    const isConfirmed = confirmedItems.has(item.produitId);
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.product.images[0] }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.product.titre}</Text>
          <Text style={styles.itemMatiere}>{getMatiere(item.product)}</Text>
          <Text style={styles.itemPrice}>{getPrix(item)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => removeItem(item.produitId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderConfirmationSection = () => {
    if (purchasedItems.length === 0) return null;
    return (
      <View style={styles.confirmSection}>
        <Text style={styles.confirmTitle}>Confirmation d'acquisition de vos commandes</Text>
        {purchasedItems.map((item) => {
          const isConfirmed = confirmedItems.has(item.produitId);
          return (
            <View key={`conf_${item.produitId}`} style={styles.confirmItem}>
              <Image source={{ uri: item.product.images[0] }} style={styles.confirmImage} />
              <View style={styles.confirmInfo}>
                <Text style={styles.confirmItemTitle} numberOfLines={1}>{item.product.titre}</Text>
                <Text style={styles.confirmItemMatiere}>{getMatiere(item.product)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.receivedBtn, isConfirmed && styles.receivedBtnDone]}
                onPress={() => markReceived(item.produitId)}
                disabled={isConfirmed}
              >
                <Text style={[styles.receivedBtnText, isConfirmed && styles.receivedBtnTextDone]}>
                  {isConfirmed ? 'Reçu ✓' : "J'ai reçu ma commande"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon panier</Text>
        <Text style={styles.articleCount}>{items.length} article{items.length > 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.produitId}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          purchasedItems.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bag-outline" size={60} color={Colors.disabled} />
              <Text style={styles.emptyText}>Votre panier est vide</Text>
            </View>
          ) : null
        }
        ListFooterComponent={renderConfirmationSection}
      />

      {/* Bouton validation */}
      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Payment', { items: items.map(({ product, ...ci }) => ci) })}
          >
            <Text style={styles.checkoutBtnText}>Validation et paiement</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  articleCount: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  itemImage: {
    width: 70,
    height: 80,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemMatiere: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  deleteBtn: {
    padding: Spacing.sm,
  },
  confirmSection: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  confirmTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  confirmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  confirmImage: {
    width: 50,
    height: 55,
    borderRadius: BorderRadius.sm,
    resizeMode: 'cover',
  },
  confirmInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  confirmItemTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  confirmItemMatiere: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  receivedBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  receivedBtnDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  receivedBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  receivedBtnTextDone: {
    color: Colors.textLight,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  checkoutBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: Colors.textLight,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
