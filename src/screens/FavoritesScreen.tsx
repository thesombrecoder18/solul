/**
 * Écran Favoris — Tab "Favoris" (coeur) — Figma écrans 25-26
 * Grille 2 colonnes des articles favoris avec suppression par trash icon
 * Données persistées via storageService
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Product, RootStackParamList } from '../types';
import { storageService } from '../services/storageService';
import { productService } from '../services/productService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

const FAVORITES_KEY = 'favorites'; // IDs des produits favoris

export default function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Charger les favoris à chaque focus de l'écran
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favIds = (await storageService.get<string[]>(FAVORITES_KEY)) || [];
    if (favIds.length === 0) {
      // Prefill avec quelques produits si vide
      const all = await productService.getAll();
      if (all.length > 0) {
        const initialIds = all.slice(0, 3).map((p) => p.id);
        await storageService.set(FAVORITES_KEY, initialIds);
        setFavorites(all.slice(0, 3));
        return;
      }
      setFavorites([]);
      return;
    }
    const allProducts = await productService.getAll();
    const favProducts = allProducts.filter((p) => favIds.includes(p.id));
    setFavorites(favProducts);
  };

  const removeFavorite = async (productId: string) => {
    const favIds = (await storageService.get<string[]>(FAVORITES_KEY)) || [];
    const updated = favIds.filter((id) => id !== productId);
    await storageService.set(FAVORITES_KEY, updated);
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  };

  const getMatiere = (product: Product): string => {
    if (product.matiere) return `Matière: ${product.matiere}`;
    if (product.categorie === 'Robes' && product.genre === 'Enfant') return 'Matière: getzner';
    if (product.titre.includes('Boubou') && product.genre === 'Femme') return 'Matière:Brocart,soie...';
    if (product.titre.includes('sirène')) return 'Matière:Organza,dent...';
    if (product.titre.includes('Demi-boubou')) return 'Matière:Bazin riche';
    return 'Matière: tissu';
  };

  const renderItem = ({ item }: { item: Product }) => {
    const prixDisplay = item.typeTransaction.includes('location')
      ? `${item.prixLocation?.toLocaleString('fr-FR') || item.prix.toLocaleString('fr-FR')}  fcfa / jour`
      : `${item.prix.toLocaleString('fr-FR')}  fcfa`;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
          {/* Image + Filled heart */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            <View style={styles.favButton}>
              <Ionicons name="heart" size={20} color={Colors.error} />
            </View>
          </View>

          {/* Infos */}
          <Text style={styles.title} numberOfLines={2}>{item.titre}</Text>
          <Text style={styles.matiere} numberOfLines={1}>{getMatiere(item)}</Text>
          <Text style={styles.prix}>{prixDisplay}</Text>
        </TouchableOpacity>

        {/* Trash icon */}
        <TouchableOpacity
          style={styles.trashBtn}
          onPress={() => removeFavorite(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={60} color={Colors.disabled} />
            <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: Spacing.lg,
  },
  card: {
    width: '100%',
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#E0D5C7',
    marginBottom: Spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
    padding: 4,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  matiere: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  prix: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  trashBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    padding: 4,
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
});
