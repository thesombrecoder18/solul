/**
 * Écran Profil — Tab "Profil" — Figma écran 27
 * Photo (placeholder rose), nom, localisation, modifier profil, icônes actions, menu
 */

import React, { useState, useCallback } from 'react';
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
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { User, RootStackParamList } from '../types';
import { authService } from '../services';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const u = await authService.getCurrentUser();
        setUser(u);
      })();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          );
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile photo + name + location */}
        <View style={styles.profileHeader}>
          {/* Pink square avatar placeholder (matches Figma) */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.photoProfil }} style={styles.avatar} />
          </View>

          <Text style={styles.name}>{user.prenom.toUpperCase()}</Text>
          <Text style={styles.location}>{user.localisation}</Text>

          {/* Modifier le profil button */}
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* 3 action icons row */}
        <View style={styles.actionIconsRow}>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => navigation.navigate('MyArticles')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="clipboard-outline" size={24} color={Colors.textPrimary} />
            </View>
            <Text style={styles.actionIconLabel}>Articles mis{'\n'}en lignes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => navigation.navigate('Reviews', { userId: user.id })}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="heart-outline" size={24} color={Colors.textPrimary} />
            </View>
            <Text style={styles.actionIconLabel}>Avis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIcon}>
            <View style={styles.iconCircle}>
              <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
            </View>
            <Text style={styles.actionIconLabel}>réglages</Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>Aide</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>Guide d'utilisation</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>A propos</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },

  /* Profile header */
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#E8B4B8',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  location: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editProfileBtn: {
    marginTop: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  editProfileText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  /* 3 action icons */
  actionIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  actionIcon: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  actionIconLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },

  /* Menu */
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.error,
  },
});
