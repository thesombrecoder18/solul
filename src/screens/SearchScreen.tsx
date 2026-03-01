/**
 * Écran Recherche — Figma écrans 21-22/31
 * Titre "Recherchez", barre de recherche avec X + Annuler
 * Top Suggestions basées sur la saisie
 * Résultats : back + query + filtres, grille 2 colonnes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Product, RootStackParamList } from '../types';
import { productService } from '../services';
import ProductCard from '../components/ui/ProductCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Suggestions prédéfinies basées sur les catégories de SOLUL
const ALL_SUGGESTIONS = [
  'robe de soirée',
  'robe évasée',
  'robe en basin',
  'robe de mariage',
  'robe pour grands événements',
  'boubou femme',
  'boubou homme',
  'boubou brodé',
  'demi-boubou',
  'tunique brodée',
  'ensemble tuxedo',
  'sac à main',
  'accessoire fête',
];

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);

  // Filtrer les suggestions en direct
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = ALL_SUGGESTIONS.filter((s) => s.includes(q));
    setSuggestions(filtered);
  }, [query]);

  // Lancer la recherche
  const executeSearch = async (searchTerm?: string) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    setQuery(term);
    const found = await productService.search({ recherche: term.trim() });
    setResults(found);
    setShowResults(true);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    setResults([]);
  };

  // === Vue suggestions ===
  if (!showResults) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>Recherchez</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.placeholder} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={Colors.placeholder}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => executeSearch()}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Top Suggestions</Text>
            {suggestions.map((s, i) => {
              // Mettre la partie qui matche en normal, le reste en bold
              const idx = s.indexOf(query.toLowerCase());
              const before = s.slice(0, idx);
              const match = s.slice(idx, idx + query.length);
              const after = s.slice(idx + query.length);

              return (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionItem}
                  onPress={() => executeSearch(s)}
                >
                  <Text style={styles.suggestionText}>
                    {before}
                    <Text style={styles.suggestionMatch}>{match}</Text>
                    <Text style={styles.suggestionBold}>{after}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </SafeAreaView>
    );
  }

  // === Vue résultats ===
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header résultats */}
      <View style={styles.resultsHeader}>
        <TouchableOpacity onPress={() => setShowResults(false)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>{query}</Text>
        <View style={styles.resultsIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grille résultats */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.resultsGrid}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={50} color={Colors.disabled} />
            <Text style={styles.emptyText}>Aucun résultat pour "{query}"</Text>
          </View>
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
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  suggestionsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  suggestionsTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  suggestionItem: {
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  suggestionMatch: {
    fontWeight: '400',
  },
  suggestionBold: {
    fontWeight: '700',
  },
  // Résultats
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  resultsTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultsIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  resultsGrid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
