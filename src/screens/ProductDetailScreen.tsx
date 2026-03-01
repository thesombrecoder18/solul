/**
 * Écran Détail Produit — Figma écrans 10-11, 19/31
 * Image large + compteur vues + favori
 * Nom vendeur + note, matière, prix, localisation
 * État, Type (Vente/Location)
 * Description avec "Tout lire"
 * Bouton "Proposer un prix" (dropdown) + "Rajouter au panier"
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Product, RootStackParamList, Conversation } from '../types';
import { fakeProducts, fakeUsers } from '../data';
import { cartService, storageService } from '../services';
import { authService } from '../services/authService';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [vendeurNom, setVendeurNom] = useState('');
  const [vendeurNote, setVendeurNote] = useState(0);
  const [vendeurNbVentes, setVendeurNbVentes] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');

  useEffect(() => {
    const p = fakeProducts.find((prod) => prod.id === productId);
    if (p) {
      setProduct(p);
      const vendeur = fakeUsers.find((u) => u.id === p.vendeurId);
      if (vendeur) {
        setVendeurNom(vendeur.prenom.toUpperCase() || vendeur.nom.toUpperCase());
        setVendeurNote(vendeur.note);
        setVendeurNbVentes(vendeur.nombreVentes);
      }
    }
  }, [productId]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Produit introuvable.</Text>
      </SafeAreaView>
    );
  }

  const isLocation = product.typeTransaction.includes('location');
  const prixDisplay = isLocation
    ? `${(product.prixLocation || product.prix).toLocaleString('fr-FR')}  fcfa / jour`
    : `${product.prix.toLocaleString('fr-FR')}  fcfa`;

  const getMatiere = (): string => {
    if (product.categorie === 'Robes' && product.genre === 'Enfant') return 'Matière: getzner';
    if (product.titre.includes('Boubou') && product.genre === 'Femme') return 'Matière:Brocart,soie';
    if (product.titre.includes('sirène')) return 'Matière:Organza,dentelle';
    if (product.titre.includes('Demi-boubou')) return 'Matière:Bazin riche';
    return 'Matière: tissu';
  };

  // Trouver la localisation du vendeur
  const vendeur = fakeUsers.find((u) => u.id === product.vendeurId);
  const localisation = vendeur?.localisation || 'Dakar';

  const handleAddToCart = async () => {
    await cartService.addItem({
      produitId: product.id,
      quantite: 1,
      type: isLocation ? 'location' : 'vente',
      dureeLocation: isLocation ? 1 : undefined,
    });
    Alert.alert('Panier', 'Article ajouté au panier !');
  };

  const handlePropose = () => {
    if (!proposedPrice.trim()) return;
    Alert.alert(
      'Proposition envoyée',
      `Votre proposition de ${parseInt(proposedPrice, 10).toLocaleString('fr-FR')} fcfa a été envoyée au vendeur.`,
    );
    setShowPriceInput(false);
    setProposedPrice('');
  };

  const handleContactVendeur = async () => {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour contacter le vendeur.');
      return;
    }
    if (currentUser.id === product.vendeurId) {
      Alert.alert('Info', 'Vous êtes le vendeur de cet article.');
      return;
    }
    // Find or create conversation with this vendor
    const convs = (await storageService.get<Conversation[]>('conversations')) || [];
    let conv = convs.find(
      (c) =>
        (c.participants[0] === currentUser.id && c.participants[1] === product.vendeurId) ||
        (c.participants[0] === product.vendeurId && c.participants[1] === currentUser.id)
    );
    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        participants: [currentUser.id, product.vendeurId],
        produitId: product.id,
        dernierMessage: '',
        dateDernierMessage: new Date().toISOString(),
      };
      convs.push(conv);
      await storageService.set('conversations', convs);
    }
    navigation.navigate('Chat', { conversationId: conv.id });
  };

  // Stars display
  const renderStars = (note: number) => {
    const full = Math.floor(note);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.titre}
        </Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          {/* Vues + Favori */}
          <View style={styles.imageOverlay}>
            <Text style={styles.vuesText}>{product.vues}</Text>
            <TouchableOpacity onPress={() => setIsFav(!isFav)}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? Colors.error : Colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Vendeur + note */}
          <View style={styles.vendeurRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Reviews', { userId: product.vendeurId })}>
              <Text style={[styles.vendeurNom, { textDecorationLine: 'underline' }]}>{vendeurNom}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Reviews', { userId: product.vendeurId })}
            >
              <Text style={styles.vendeurNote}>
                {isLocation ? 'utilisateur' : 'vendeuse'} noté{isLocation ? '' : 'e'} {vendeurNote}/5{' '}
                <Text style={styles.stars}>{renderStars(vendeurNote)}</Text>
                {'  '}({vendeurNbVentes} vente{vendeurNbVentes > 1 ? 's' : ''})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.voirAvisBtn}
              onPress={() => navigation.navigate('Reviews', { userId: product.vendeurId })}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.primary} />
              <Text style={styles.voirAvisText}>Voir les avis</Text>
            </TouchableOpacity>
          </View>

          {/* Matière + Prix */}
          <View style={styles.prixRow}>
            <Text style={styles.matiere}>{getMatiere()}</Text>
            <Text style={styles.prix}>{prixDisplay}</Text>
          </View>

          {/* Localisation */}
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.locText}>{localisation.toUpperCase()}</Text>
          </View>

          {/* État + Type */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ÉTAT</Text>
              <Text style={styles.infoValue}>Très bon</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>TYPE</Text>
              <Text style={styles.infoValue}>{isLocation ? 'Location' : 'Vente'}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText} numberOfLines={showFullDesc ? undefined : 5}>
            {product.description}
          </Text>
          {!showFullDesc && (
            <TouchableOpacity onPress={() => setShowFullDesc(true)}>
              <Text style={styles.readMore}>...Tout lire</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom bar : Proposer un prix + Rajouter au panier */}
      <View style={styles.bottomBar}>
        <View>
          <TouchableOpacity
            style={styles.proposeButton}
            onPress={() => setShowPriceInput(!showPriceInput)}
          >
            <Text style={styles.proposeText}>Proposer un prix</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          {showPriceInput && (
            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputRow}>
                <TextInput
                  style={[styles.priceInput, { flex: 1 }]}
                  placeholder="Écrire le prix ici"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="number-pad"
                  value={proposedPrice}
                  onChangeText={setProposedPrice}
                  onSubmitEditing={handlePropose}
                />
                <TouchableOpacity style={styles.okButton} onPress={handlePropose}>
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.contactButton} onPress={handleContactVendeur}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addCartButton} onPress={handleAddToCart}>
          <Text style={styles.addCartText}>Rajouter au panier</Text>
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
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  imageContainer: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: (SCREEN_WIDTH - Spacing.lg * 2) * 0.85,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  vuesText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  vendeurRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendeurNom: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vendeurNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  voirAvisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  voirAvisText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  stars: {
    color: Colors.primary,
    fontSize: FontSize.sm,
  },
  prixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matiere: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  prix: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  locText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.xxl,
  },
  infoCol: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  descTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  descText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  readMore: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundWhite,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  proposeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 6,
  },
  proposeText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  priceInputContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  okButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okButtonText: {
    color: Colors.textLight,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  addCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  addCartText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    fontWeight: '600',
  },
  contactButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
