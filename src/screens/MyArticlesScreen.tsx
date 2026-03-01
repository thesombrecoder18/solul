/**
 * Écran Articles mis en lignes — Figma écran 31
 * Grille 2 colonnes des articles publiés par l'utilisateur connecté
 * Tag overlay (#bbs, #y4p…) sur les images, trash icon pour supprimer
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
import { productService } from '../services/productService';
import { authService } from '../services/authService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

export default function MyArticlesScreen() {
  const navigation = useNavigation<Nav>();
  const [articles, setArticles] = useState<Product[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadArticles();
    }, [])
  );

  const loadArticles = async () => {
    const user = await authService.getCurrentUser();
    if (!user) return;
    const myProducts = await productService.getByVendeur(user.id);
    setArticles(myProducts);
  };

  const handleDelete = (productId: string, title: string) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await productService.remove(productId);
            setArticles((prev) => prev.filter((p) => p.id !== productId));
          },
        },
      ]
    );
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
          {/* Image with tag overlay */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            {item.tag && (
              <View style={styles.tagOverlay}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            )}
          </View>

          {/* Infos */}
          <Text style={styles.title} numberOfLines={2}>{item.titre}</Text>
          <Text style={styles.matiere} numberOfLines={1}>{getMatiere(item)}</Text>
          <Text style={styles.prix}>{prixDisplay}</Text>
        </TouchableOpacity>

        {/* Trash icon */}
        <TouchableOpacity
          style={styles.trashBtn}
          onPress={() => handleDelete(item.id, item.titre)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articles mis en lignes</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={60} color={Colors.disabled} />
            <Text style={styles.emptyText}>Aucun article publié</Text>
            <Text style={styles.emptySubtext}>
              Vos articles mis en vente ou en location apparaîtront ici
            </Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  tagOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
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
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
