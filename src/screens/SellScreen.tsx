/**
 * Écran Mise en vente / location — Figma écrans 23-24
 * Formulaire complet avec sélection d'images + écran de confirmation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import { Categorie, EtatProduit, Product } from '../types';

const CATEGORIES: Categorie[] = ['Robes', 'Tuniques', 'Boubous', 'Tuxedos', 'Ensembles', 'Chaussures', 'Sacs', 'Accessoires'];
const LOCALITES = ['Dakar', 'Saint-Louis', 'Thiès', 'Louga', 'Kaolack', 'Ziguinchor', 'Diourbel', 'Fatick', 'Matam', 'Kaffrine', 'Kédougou', 'Sédhiou', 'Tambacounda', 'Kolda'];
const ETATS: EtatProduit[] = ['Excellent', 'En bon état'];
const MAX_IMAGES = 5;

function generateTag(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let tag = '#';
  for (let i = 0; i < 3; i++) {
    tag += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return tag;
}

export default function SellScreen() {
  // Form state
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [matiere, setMatiere] = useState('');
  const [taille, setTaille] = useState('');
  const [prix, setPrix] = useState('');
  const [prixLocation, setPrixLocation] = useState('');
  const [selectedType, setSelectedType] = useState<'vente' | 'location'>('vente');
  const [categorie, setCategorie] = useState<Categorie | ''>('');
  const [localite, setLocalite] = useState('');
  const [etat, setEtat] = useState<EtatProduit | ''>('');
  const [marchandage, setMarchandage] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  // Dropdown state
  const [showCategorie, setShowCategorie] = useState(false);
  const [showLocalite, setShowLocalite] = useState(false);
  const [showEtat, setShowEtat] = useState(false);

  // Published state
  const [published, setPublished] = useState(false);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);
  const [publishType, setPublishType] = useState<'vente' | 'location'>('vente');

  // ==================== IMAGE PICKER ====================

  /** Demander la permission d'accéder à la galerie */
  const requestPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin d\'accéder à votre galerie pour ajouter des photos.'
      );
      return false;
    }
    return true;
  };

  /** Ouvrir la galerie pour sélectionner des images */
  const pickFromGallery = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limite atteinte', `Vous pouvez ajouter au maximum ${MAX_IMAGES} photos.`);
      return;
    }
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  /** Ouvrir la caméra pour prendre une photo */
  const takePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limite atteinte', `Vous pouvez ajouter au maximum ${MAX_IMAGES} photos.`);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin d\'accéder à votre caméra pour prendre une photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, MAX_IMAGES));
    }
  };

  /** Supprimer une image */
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /** Dialog pour choisir entre galerie et caméra */
  const showImageOptions = () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limite atteinte', `Vous pouvez ajouter au maximum ${MAX_IMAGES} photos.`);
      return;
    }
    Alert.alert(
      'Ajouter une photo',
      'Choisissez la source de votre image',
      [
        { text: 'Galerie', onPress: pickFromGallery },
        { text: 'Caméra', onPress: takePhoto },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  // ==================== FORM ====================

  const closeAllDropdowns = () => {
    setShowCategorie(false);
    setShowLocalite(false);
    setShowEtat(false);
  };

  const resetForm = () => {
    setTitre('');
    setDescription('');
    setMatiere('');
    setTaille('');
    setPrix('');
    setPrixLocation('');
    setSelectedType('vente');
    setCategorie('');
    setLocalite('');
    setEtat('');
    setMarchandage(true);
    setImages([]);
    closeAllDropdowns();
    setPublished(false);
    setPublishedProduct(null);
  };

  const handlePublish = async (type: 'vente' | 'location') => {
    // Validations
    if (images.length === 0) {
      Alert.alert('Photos requises', 'Veuillez ajouter au moins une photo de votre article.');
      return;
    }
    if (!titre.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un titre.');
      return;
    }
    if (!categorie) {
      Alert.alert('Champ requis', 'Veuillez sélectionner une catégorie.');
      return;
    }
    if (!etat) {
      Alert.alert('Champ requis', 'Veuillez sélectionner l\'état de l\'article.');
      return;
    }
    if (type === 'vente' && !prix.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un prix de vente.');
      return;
    }
    if (type === 'location' && !prixLocation.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un prix de location.');
      return;
    }

    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier.');
      return;
    }

    const parsedPrix = parseInt(prix, 10) || 0;
    const parsedPrixLoc = parseInt(prixLocation, 10) || 0;

    try {
      const product = await productService.create({
        vendeurId: currentUser.id,
        titre: titre.trim(),
        description: description.trim() || 'Aucune description fournie.',
        prix: type === 'vente' ? parsedPrix : parsedPrixLoc,
        prixLocation: type === 'location' ? parsedPrixLoc : (parsedPrixLoc > 0 ? parsedPrixLoc : undefined),
        categorie: categorie as Categorie,
        genre: 'Unisexe',
        taille: taille.trim() || 'Unique',
        matiere: matiere.trim() || undefined,
        localite: localite || currentUser.localisation,
        etat: etat as EtatProduit,
        typeTransaction: [type],
        images: images,
        marchandage,
        boost: false,
        tag: generateTag(),
      });
      setPublishType(type);
      setPublishedProduct(product);
      setPublished(true);
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication.');
    }
  };

  // ==================== CONFIRMATION SCREEN (Figma écran 24) ====================
  if (published && publishedProduct) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Mise en {publishType === 'vente' ? 'vente' : 'location'} d'un article
          </Text>
        </View>

        <View style={styles.confirmationContainer}>
          {/* Green check icon */}
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.success} />
          </View>

          <Text style={styles.confirmationText}>
            Votre article a été mis en {publishType === 'vente' ? 'vente' : 'location'} avec succès !
          </Text>

          <Text style={styles.confirmationTag}>
            article {publishedProduct.tag || '#---'}
          </Text>

          {/* Image preview */}
          {publishedProduct.images.length > 0 && (
            <Image
              source={{ uri: publishedProduct.images[0] }}
              style={styles.confirmationImage}
            />
          )}

          {/* Confirmation card */}
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationQuestion}>
              Souhaitez-vous effectuer une autre mise en vente ou en location ?
            </Text>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity style={styles.confirmBtn} onPress={resetForm}>
                <Text style={styles.confirmBtnText}>OUI</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={resetForm}>
                <Text style={styles.confirmBtnText}>NON</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ==================== FORM SCREEN (Figma écran 23) ====================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mise en vente ou en location d'un article</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Photo upload area ── */}
          <View style={styles.photoBox}>
            <View style={styles.photoIconRow}>
              <Ionicons name="camera-outline" size={30} color={Colors.textSecondary} />
              <Text style={styles.photoTitle}>Ajouter des photos</Text>
            </View>
            <Text style={styles.photoSubtitle}>
              Une bonne lumière, un bon cadre pour mettre en valeur votre article.{'\n'}
              ({images.length}/{MAX_IMAGES} photos)
            </Text>

            {/* Thumbnails des images sélectionnées */}
            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagePreviewRow}
                contentContainerStyle={styles.imagePreviewContent}
              >
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.imageThumbContainer}>
                    <Image source={{ uri }} style={styles.imageThumb} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(idx)}
                    >
                      <Ionicons name="close-circle" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                    {idx === 0 && (
                      <View style={styles.mainBadge}>
                        <Text style={styles.mainBadgeText}>Principale</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Boutons galerie + caméra */}
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                <Ionicons name="images-outline" size={18} color="#FFFFFF" />
                <Text style={styles.galleryBtnText}>Galerie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                <Text style={styles.galleryBtnText}>Caméra</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Titre ── */}
          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.input}
            placeholder="ex : Grand Boubou Homme"
            placeholderTextColor={Colors.placeholder}
            value={titre}
            onChangeText={setTitre}
          />

          {/* ── Description ── */}
          <Text style={styles.label}>Description de ton article</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Exemple : Je revends ce magnifique ensemble boubou de la collection ARWA, porté une seule fois pour une occasion spéciale..."
            placeholderTextColor={Colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* ── Type de transaction (Vente / Location) ── */}
          <Text style={styles.label}>Type de transaction</Text>
          <View style={styles.typeToggleRow}>
            <TouchableOpacity
              style={[styles.typeToggleBtn, selectedType === 'vente' && styles.typeToggleBtnActive]}
              onPress={() => setSelectedType('vente')}
            >
              <Text style={[styles.typeToggleText, selectedType === 'vente' && styles.typeToggleTextActive]}>
                Vente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeToggleBtn, selectedType === 'location' && styles.typeToggleBtnActive]}
              onPress={() => setSelectedType('location')}
            >
              <Text style={[styles.typeToggleText, selectedType === 'location' && styles.typeToggleTextActive]}>
                Location
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Prix (conditionnel selon le type) ── */}
          {selectedType === 'vente' ? (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={styles.label}>Prix de vente (FCFA)</Text>
              <TextInput
                style={styles.input}
                placeholder="EX: 25000"
                placeholderTextColor={Colors.placeholder}
                value={prix}
                onChangeText={setPrix}
                keyboardType="numeric"
              />
            </View>
          ) : (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={styles.label}>Prix location/jour (FCFA)</Text>
              <TextInput
                style={styles.input}
                placeholder="EX: 5000"
                placeholderTextColor={Colors.placeholder}
                value={prixLocation}
                onChangeText={setPrixLocation}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* ── Matière + Taille (side by side) ── */}
          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Matière tissu</Text>
              <TextInput
                style={styles.input}
                placeholder="EX: Bazin"
                placeholderTextColor={Colors.placeholder}
                value={matiere}
                onChangeText={setMatiere}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Taille/dimensions</Text>
              <TextInput
                style={styles.input}
                placeholder="EX: 38/L/120cm"
                placeholderTextColor={Colors.placeholder}
                value={taille}
                onChangeText={setTaille}
              />
            </View>
          </View>

          {/* ── Catégorie dropdown ── */}
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              setShowCategorie(!showCategorie);
              setShowLocalite(false);
              setShowEtat(false);
            }}
          >
            <Text style={[styles.dropdownLabel, categorie ? styles.dropdownLabelSelected : null]}>
              {categorie ? categorie : 'Catégorie'}
            </Text>
            <Ionicons name={showCategorie ? 'chevron-up' : 'chevron-forward'} size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          {showCategorie && (
            <View style={styles.dropdownList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.dropdownItem, categorie === cat && styles.dropdownItemActive]}
                  onPress={() => { setCategorie(cat); setShowCategorie(false); }}
                >
                  <Text style={[styles.dropdownItemText, categorie === cat && styles.dropdownItemTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Localité dropdown ── */}
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              setShowLocalite(!showLocalite);
              setShowCategorie(false);
              setShowEtat(false);
            }}
          >
            <Text style={[styles.dropdownLabel, localite ? styles.dropdownLabelSelected : null]}>
              {localite ? localite : 'Localité'}
            </Text>
            <Ionicons name={showLocalite ? 'chevron-up' : 'chevron-forward'} size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          {showLocalite && (
            <View style={styles.dropdownList}>
              {LOCALITES.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.dropdownItem, localite === loc && styles.dropdownItemActive]}
                  onPress={() => { setLocalite(loc); setShowLocalite(false); }}
                >
                  <Text style={[styles.dropdownItemText, localite === loc && styles.dropdownItemTextActive]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── État dropdown ── */}
          <TouchableOpacity
            style={styles.dropdownRow}
            onPress={() => {
              setShowEtat(!showEtat);
              setShowCategorie(false);
              setShowLocalite(false);
            }}
          >
            <Text style={[styles.dropdownLabel, etat ? styles.dropdownLabelSelected : null]}>
              {etat ? etat : 'État'}
            </Text>
            <Ionicons name={showEtat ? 'chevron-up' : 'chevron-forward'} size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          {showEtat && (
            <View style={styles.dropdownList}>
              {ETATS.map((et) => (
                <TouchableOpacity
                  key={et}
                  style={[styles.dropdownItem, etat === et && styles.dropdownItemActive]}
                  onPress={() => { setEtat(et); setShowEtat(false); }}
                >
                  <Text style={[styles.dropdownItemText, etat === et && styles.dropdownItemTextActive]}>
                    {et}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Marchandage toggle ── */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setMarchandage(!marchandage)}
          >
            <Text style={styles.toggleLabel}>Accepter le marchandage ?</Text>
            <View style={[styles.toggleTrack, marchandage && styles.toggleTrackActive]}>
              <View style={[styles.toggleThumb, marchandage && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>

          {/* ── Action button: Publier ── */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.vendreBtn} onPress={() => handlePublish(selectedType)}>
              <Text style={styles.actionBtnText}>
                {selectedType === 'vente' ? 'Mettre en vente' : 'Mettre en location'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  /* ── Form ── */
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },

  /* Photo box */
  photoBox: {
    backgroundColor: '#E8E0D4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  photoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  photoTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  photoSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  galleryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  /* Image previews */
  imagePreviewRow: {
    marginBottom: Spacing.md,
    maxHeight: 110,
  },
  imagePreviewContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
  imageThumbContainer: {
    position: 'relative',
    width: 90,
    height: 100,
  },
  imageThumb: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mainBadgeText: {
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  /* Labels & Inputs */
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundWhite,
  },
  textArea: {
    height: 110,
    paddingTop: 12,
  },

  /* Side by side fields */
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },

  /* Type toggle (Vente / Location) */
  typeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeToggleBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
  },
  typeToggleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeToggleText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeToggleTextActive: {
    color: Colors.textLight,
  },

  /* Dropdown rows */
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Spacing.sm,
  },
  dropdownLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dropdownLabelSelected: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  dropdownList: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary + '20',
  },
  dropdownItemText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },

  /* Toggle (marchandage) */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Spacing.sm,
  },
  toggleLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: Colors.success,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  /* Action buttons */
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  vendreBtn: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  louerBtn: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionBtnText: {
    color: Colors.textLight,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

  /* ── Confirmation screen ── */
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  confirmationText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  confirmationTag: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  confirmationImage: {
    width: 160,
    height: 160,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  confirmationCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmationQuestion: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  confirmBtn: {
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: 36,
  },
  confirmBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
