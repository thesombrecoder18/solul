/**
 * Écran Avis — Figma écrans 28-30
 * Vue globale des avis d'un vendeur + formulaire "Donner mon avis"
 * Données stockées via storageService pour la cohérence
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Avis, RootStackParamList, User } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { fakeUsers } from '../data';

type ReviewsRouteProp = RouteProp<RootStackParamList, 'Reviews'>;

const REVIEWS_KEY = 'reviews'; // Avis[] global

// Fake reviews to seed
const SEED_REVIEWS: Avis[] = [
  { id: 'avis_1', auteurId: 'user_1', cibleId: 'user_2', note: 5, commentaire: 'Excellente vendeuse, article conforme à la description. Livraison rapide !', date: '2026-01-15' },
  { id: 'avis_2', auteurId: 'user_3', cibleId: 'user_2', note: 4, commentaire: 'Très bon article, bien emballé. Je recommande.', date: '2026-01-20' },
  { id: 'avis_3', auteurId: 'user_5', cibleId: 'user_2', note: 4, commentaire: 'Belle qualité, le tissu est magnifique. Communication agréable avec la vendeuse.', date: '2026-02-01' },
  { id: 'avis_4', auteurId: 'user_6', cibleId: 'user_2', note: 5, commentaire: 'Parfait ! Article en excellent état comme décrit. Merci beaucoup.', date: '2026-02-05' },
  { id: 'avis_5', auteurId: 'user_7', cibleId: 'user_2', note: 4, commentaire: 'Bonne expérience d\'achat, je suis satisfaite.', date: '2026-02-10' },
  { id: 'avis_6', auteurId: 'user_4', cibleId: 'user_2', note: 3, commentaire: 'Article correct mais un peu différent de la photo. Néanmoins satisfait dans l\'ensemble.', date: '2026-02-12' },
  { id: 'avis_7', auteurId: 'user_1', cibleId: 'user_2', note: 4, commentaire: 'Deuxième achat chez cette vendeuse. Toujours aussi bien !', date: '2026-02-15' },
  { id: 'avis_8', auteurId: 'user_3', cibleId: 'user_2', note: 5, commentaire: 'Service impeccable, je recommande vivement.', date: '2026-02-18' },
  { id: 'avis_9', auteurId: 'user_5', cibleId: 'user_2', note: 4, commentaire: 'Très satisfaite de mon achat. Le boubou est magnifique.', date: '2026-02-20' },
  { id: 'avis_10', auteurId: 'user_7', cibleId: 'user_2', note: 4, commentaire: 'Bon rapport qualité-prix. La vendeuse est réactive.', date: '2026-02-22' },
];

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReviewsRouteProp>();
  const { userId } = route.params;

  const [reviews, setReviews] = useState<Avis[]>([]);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showGiveReview, setShowGiveReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // avis ID being replied to
  const [replyText, setReplyText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [userId])
  );

  const loadReviews = async () => {
    // Find target user
    const user = fakeUsers.find((u) => u.id === userId) || null;
    setTargetUser(user);

    // Get current user
    const cu = await authService.getCurrentUser();
    setCurrentUserId(cu?.id || null);

    // Load or seed reviews
    let allReviews = (await storageService.get<Avis[]>(REVIEWS_KEY)) || [];
    if (allReviews.length === 0) {
      allReviews = SEED_REVIEWS;
      await storageService.set(REVIEWS_KEY, allReviews);
    }

    const userReviews = allReviews.filter((r) => r.cibleId === userId);
    setReviews(userReviews);
    setCurrentReviewIndex(0);
  };

  const submitReview = async () => {
    if (newRating === 0) {
      Alert.alert('Note requise', 'Veuillez sélectionner une note.');
      return;
    }
    if (!newComment.trim()) {
      Alert.alert('Commentaire requis', 'Veuillez écrire un commentaire.');
      return;
    }

    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Erreur', 'Vous devez être connecté.');
      return;
    }

    // Bloquer l'auto-évaluation
    if (currentUser.id === userId) {
      Alert.alert('Interdit', 'Vous ne pouvez pas laisser un avis sur votre propre profil.');
      return;
    }

    const newAvis: Avis = {
      id: `avis_${Date.now()}`,
      auteurId: currentUser.id,
      cibleId: userId,
      note: newRating,
      commentaire: newComment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    let allReviews = (await storageService.get<Avis[]>(REVIEWS_KEY)) || [];
    allReviews.push(newAvis);
    await storageService.set(REVIEWS_KEY, allReviews);

    setReviews((prev) => [...prev, newAvis]);
    setNewRating(0);
    setNewComment('');
    setShowGiveReview(false);
    Alert.alert('Merci !', 'Votre avis a été soumis avec succès.');
  };

  const submitReply = async (avisId: string) => {
    if (!replyText.trim()) {
      Alert.alert('Réponse requise', 'Veuillez écrire une réponse.');
      return;
    }

    let allReviews = (await storageService.get<Avis[]>(REVIEWS_KEY)) || [];
    const idx = allReviews.findIndex((r) => r.id === avisId);
    if (idx !== -1) {
      allReviews[idx].reponse = replyText.trim();
      allReviews[idx].reponseDate = new Date().toISOString().split('T')[0];
      await storageService.set(REVIEWS_KEY, allReviews);

      // Mettre à jour l'avis local
      setReviews((prev) =>
        prev.map((r) =>
          r.id === avisId
            ? { ...r, reponse: replyText.trim(), reponseDate: new Date().toISOString().split('T')[0] }
            : r
        )
      );
    }

    setReplyingTo(null);
    setReplyText('');
    Alert.alert('Réponse envoyée', 'Votre réponse a été ajoutée.');
  };

  // Compute stats
  const totalReviews = reviews.length;
  const noteGlobale = totalReviews > 0
    ? Math.round((reviews.reduce((s, r) => s + r.note, 0) / totalReviews) * 10) / 10
    : 0;
  const starBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.note === star).length,
  }));

  const getUserName = (uid: string): string => {
    const u = fakeUsers.find((f) => f.id === uid);
    return u ? u.prenom : 'Utilisateur';
  };

  const getTimeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 30) return `il y a ${days} jours`;
    const months = Math.floor(days / 30);
    return `il y a ${months} mois`;
  };

  const currentReview = reviews[currentReviewIndex];

  // ==================== GIVE REVIEW FORM (Figma écran 29) ====================
  if (showGiveReview) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setShowGiveReview(false)}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Avis</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* User info */}
          {targetUser && (
            <View style={styles.userInfoRow}>
              <Image source={{ uri: targetUser.photoProfil }} style={styles.userAvatar} />
              <View>
                <Text style={styles.userName}>{targetUser.prenom.toUpperCase()}</Text>
                <Text style={styles.userLocation}>{targetUser.localisation}</Text>
              </View>
            </View>
          )}

          {/* Note globale card */}
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Note globale {Math.round(noteGlobale)}/5</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={i <= Math.round(noteGlobale) ? 'star' : 'star-outline'}
                  size={28}
                  color={Colors.primary}
                />
              ))}
            </View>
          </View>

          {/* Help text */}
          <Text style={styles.helpText}>
            Votre avis aide les autres utilisateurs à mieux connaître le vendeur
          </Text>

          {/* Star input */}
          <View style={styles.starsInputRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setNewRating(i)}>
                <Ionicons
                  name={i <= newRating ? 'star' : 'star-outline'}
                  size={40}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment input */}
          <TextInput
            style={styles.commentInput}
            placeholder="Écrivez votre avis..."
            placeholderTextColor={Colors.placeholder}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Submit button */}
          <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
            <Text style={styles.submitBtnText}>Soumettre mon avis</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==================== REVIEWS OVERVIEW (Figma écrans 28 & 30) ====================
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avis</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User info */}
        {targetUser && (
          <View style={styles.userInfoRow}>
            <Image source={{ uri: targetUser.photoProfil }} style={styles.userAvatar} />
            <View>
              <Text style={styles.userName}>{targetUser.prenom.toUpperCase()}</Text>
              <Text style={styles.userLocation}>{targetUser.localisation}</Text>
            </View>
          </View>
        )}

        {/* Note globale card */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note globale {Math.round(noteGlobale)}/5</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(noteGlobale) ? 'star' : 'star-outline'}
                size={28}
                color={Colors.primary}
              />
            ))}
          </View>
        </View>

        {/* People count */}
        <Text style={styles.peopleCount}>
          {totalReviews} personnes ont donné leur avis
        </Text>

        {/* Star breakdown bars */}
        <View style={styles.breakdownContainer}>
          {starBreakdown.map(({ star, count }) => {
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <View key={star} style={styles.breakdownRow}>
                <Text style={styles.breakdownCount}>{count}</Text>
                <Text style={styles.breakdownLabel}>avis {star} étoile{star > 1 ? 's' : ''}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.max(pct, 2)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Current review card */}
        {currentReview && (
          <View style={styles.reviewCard}>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>
                avis {currentReviewIndex + 1} sur {totalReviews}
              </Text>
            </View>

            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={i <= currentReview.note ? 'star' : 'star-outline'}
                  size={18}
                  color={Colors.primary}
                />
              ))}
            </View>

            <View style={styles.reviewAuthorRow}>
              <View style={styles.reviewAuthorAvatar}>
                <Text style={styles.reviewAuthorInitial}>
                  {getUserName(currentReview.auteurId).charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.reviewAuthorName}>{getUserName(currentReview.auteurId)}</Text>
                <Text style={styles.reviewDate}>{getTimeAgo(currentReview.date)}</Text>
              </View>
            </View>

            <Text style={styles.reviewText}>
              {currentReview.commentaire}
            </Text>

            {/* Réponse existante du vendeur */}
            {currentReview.reponse && (
              <View style={styles.replyContainer}>
                <Text style={styles.replyLabel}>Réponse du vendeur :</Text>
                <Text style={styles.replyText}>{currentReview.reponse}</Text>
              </View>
            )}

            {/* Bouton répondre (seulement pour le propriétaire du profil) */}
            {currentUserId === userId && !currentReview.reponse && (
              <>
                {replyingTo === currentReview.id ? (
                  <View style={styles.replyInputContainer}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Écrire votre réponse..."
                      placeholderTextColor={Colors.placeholder}
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                    />
                    <View style={styles.replyActions}>
                      <TouchableOpacity
                        style={styles.replyCancelBtn}
                        onPress={() => { setReplyingTo(null); setReplyText(''); }}
                      >
                        <Text style={styles.replyCancelText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.replySendBtn}
                        onPress={() => submitReply(currentReview.id)}
                      >
                        <Text style={styles.replySendText}>Envoyer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.replyBtn}
                    onPress={() => setReplyingTo(currentReview.id)}
                  >
                    <Ionicons name="return-down-forward-outline" size={16} color={Colors.primary} />
                    <Text style={styles.replyBtnText}>Répondre</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Navigation buttons */}
        <View style={styles.reviewActions}>
          {totalReviews > 1 && (
            <TouchableOpacity
              style={styles.nextReviewBtn}
              onPress={() => {
                setCurrentReviewIndex((prev) => (prev + 1) % totalReviews);
              }}
            >
              <Text style={styles.nextReviewText}>Lire l'avis suivant</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.giveReviewBtn}
            onPress={() => {
              if (currentUserId === userId) {
                Alert.alert('Interdit', 'Vous ne pouvez pas laisser un avis sur votre propre profil. Vous pouvez répondre aux commentaires existants.');
              } else {
                setShowGiveReview(true);
              }
            }}
          >
            <Text style={styles.giveReviewText}>
              {currentUserId === userId ? 'Répondre aux avis' : 'Donner mon avis'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },

  /* User info */
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#E8B4B8',
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  userLocation: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* Note globale */
  noteCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noteTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },

  /* People count */
  peopleCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  /* Breakdown bars */
  breakdownContainer: {
    marginBottom: Spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownCount: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    width: 24,
    textAlign: 'right',
    marginRight: 6,
  },
  breakdownLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 90,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  /* Review card */
  reviewCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewBadge: {
    backgroundColor: Colors.primary + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  reviewBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: Spacing.md,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  reviewAuthorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAuthorInitial: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textLight,
  },
  reviewAuthorName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reviewDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  reviewText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  /* Review actions */
  reviewActions: {
    gap: Spacing.md,
  },
  nextReviewBtn: {
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextReviewText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  giveReviewBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  giveReviewText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textLight,
  },

  /* Give review form */
  helpText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  starsInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundWhite,
    height: 130,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  submitBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: Colors.textLight,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

  /* Reply styles */
  replyContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  replyLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  replyText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  replyBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  replyInputContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  replyCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  replyCancelText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  replySendBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
  },
  replySendText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontWeight: '600',
  },
});
