/**
 * Carte produit — Grille 2 colonnes sur la Boutique
 * Image + coeur favoris, titre, matière, prix
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants';
import { Product } from '../../types';

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);

  // Extraire la matière de la description ou titre
  const getMatiere = (): string => {
    if (product.categorie === 'Robes' && product.genre === 'Enfant') return 'Matière: getzner';
    if (product.titre.includes('Boubou') && product.genre === 'Femme') return 'Matière:Brocart,soie...';
    if (product.titre.includes('sirène')) return 'Matière:Organza,dent...';
    if (product.titre.includes('Demi-boubou')) return 'Matière:Bazin riche';
    return 'Matière: tissu';
  };

  const prixDisplay = product.typeTransaction.includes('location')
    ? `${product.prixLocation?.toLocaleString('fr-FR') || product.prix.toLocaleString('fr-FR')}  fcfa / jour`
    : `${product.prix.toLocaleString('fr-FR')}  fcfa`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Image + Favori */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.image} />
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => setIsFav(!isFav)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? Colors.error : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Infos */}
      <Text style={styles.title} numberOfLines={2}>
        {product.titre}
      </Text>
      <Text style={styles.matiere} numberOfLines={1}>
        {getMatiere()}
      </Text>
      <Text style={styles.prix}>{prixDisplay}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background,
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
    borderRadius: BorderRadius.full,
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
});
