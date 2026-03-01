/**
 * Écran Accueil / Boutique — Figma écrans 7-9/31
 * Header: "Dalal ak jaam {nom} !" + icônes notif/messages
 * Barre de recherche
 * Section Boutique : filtres genre (Tout/Femmes/Hommes/Enfants),
 * icône filtre avancé + recherche, slider prix
 * Grille produits 2 colonnes
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Product, Genre, RootStackParamList } from '../types';
import { fakeProducts } from '../data';
import { storageService } from '../services';
import ProductCard from '../components/ui/ProductCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GENRE_FILTERS: { label: string; value: Genre | 'Tout' }[] = [
  { label: 'Tout', value: 'Tout' },
  { label: 'Femmes', value: 'Femme' },
  { label: 'Hommes', value: 'Homme' },
  { label: 'Enfants', value: 'Enfant' },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'Tout'>('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(150000);
  const [userName, setUserName] = useState('Binta');
  const sliderWidth = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (sliderWidth.current <= 0) return;
        const ratio = Math.max(0, Math.min(1, (gestureState.moveX - 80) / sliderWidth.current));
        const newMax = Math.round((ratio * 150000) / 1000) * 1000;
        setPriceMax(Math.max(0, Math.min(150000, newMax)));
      },
    })
  ).current;

  const onSliderLayout = (e: LayoutChangeEvent) => {
    sliderWidth.current = e.nativeEvent.layout.width;
  };

  useFocusEffect(
    useCallback(() => {
      // Charger les produits + initialiser avec les fake si vide
      const init = async () => {
        let storedProducts = await storageService.get<Product[]>('products');
        if (!storedProducts || storedProducts.length === 0) {
          await storageService.set('products', fakeProducts);
          storedProducts = fakeProducts;
        }
        setProducts(storedProducts);

        // Nom de l'utilisateur connecté
        const user = await storageService.get<{ nom: string; prenom: string }>('current_user');
        if (user) {
          setUserName(user.nom || user.prenom || 'Binta');
        }
      };
      init();
    }, [])
  );

  const applyFilters = useCallback(() => {
    let result = [...products];

    // Filtre genre
    if (selectedGenre !== 'Tout') {
      result = result.filter((p) => p.genre === selectedGenre);
    }

    // Filtre recherche
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.titre.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categorie.toLowerCase().includes(q)
      );
    }

    // Filtre prix
    result = result.filter((p) => p.prix >= priceMin && p.prix <= priceMax);

    setFilteredProducts(result);
  }, [products, selectedGenre, searchQuery, priceMin, priceMax]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productWrapper, index % 2 === 0 ? { marginRight: Spacing.md } : {}]}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Dalal ak jaam {userName} !</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Messages')}
            style={styles.iconButton}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de recherche — navigates to dedicated SearchScreen */}
      <TouchableOpacity
        style={styles.searchContainer}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search-outline" size={18} color={Colors.placeholder} style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Cherche un article...</Text>
      </TouchableOpacity>

      {/* Titre Boutique + icônes filtres */}
      <View style={styles.boutiqueHeader}>
        <Text style={styles.boutiqueTitle}>Boutique</Text>
        <View style={styles.boutiqueIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="options-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs genre */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreTabs}>
        {GENRE_FILTERS.map((genre) => (
          <TouchableOpacity
            key={genre.value}
            style={[
              styles.genreTab,
              selectedGenre === genre.value && styles.genreTabActive,
            ]}
            onPress={() => setSelectedGenre(genre.value)}
          >
            <Text
              style={[
                styles.genreTabText,
                selectedGenre === genre.value && styles.genreTabTextActive,
              ]}
            >
              {genre.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtre prix — toujours visible */}
      <View style={styles.priceFilterRow}>
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>{priceMin} fcfa</Text>
        </View>
        <View
          style={styles.priceSliderTrack}
          onLayout={onSliderLayout}
          {...panResponder.panHandlers}
        >
          <View style={[styles.priceSliderFill, { width: `${(priceMax / 150000) * 100}%` }]} />
          <View style={[styles.priceSliderThumb, { left: `${(priceMax / 150000) * 100}%` }]} />
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>{priceMax.toLocaleString('fr-FR')} fcfa</Text>
        </View>
      </View>

      {/* Grille produits */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun article trouvé.</Text>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F5F5F5',
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.placeholder,
  },
  boutiqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  boutiqueTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  boutiqueIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  genreTabs: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    maxHeight: 44,
  },
  genreTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    backgroundColor: Colors.backgroundWhite,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genreTabText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  genreTabTextActive: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  priceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: 10,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
  },
  priceBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  priceSliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    position: 'relative',
  },
  priceSliderFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  priceSliderThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: -8,
  },
  productGrid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  productWrapper: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: Spacing.xxl,
  },
});
