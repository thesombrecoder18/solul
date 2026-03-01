/**
 * Écran Notifications — Figma écran 16/31
 * Cards : proposition de prix (avec "Conversez"), paiement reçu, favoris
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Notification, RootStackParamList } from '../types';
import { fakeNotifications } from '../data';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(fakeNotifications);
  }, []);

  const getIcon = (type: Notification['type']): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type) {
      case 'proposition_prix':
        return { name: 'pricetag-outline', color: Colors.primary };
      case 'paiement_recu':
        return { name: 'card-outline', color: Colors.success };
      case 'favoris':
        return { name: 'heart-outline', color: Colors.error };
      case 'commande':
        return { name: 'bag-check-outline', color: Colors.info };
      default:
        return { name: 'notifications-outline', color: Colors.textSecondary };
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date('2026-03-01T12:00:00');
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Il y a quelques minutes';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  const handleConversez = (notif: Notification) => {
    if (notif.lien) {
      navigation.navigate('Chat', { conversationId: notif.lien });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getIcon(item.type);
    return (
      <View style={[styles.notifCard, !item.lu && styles.notifUnread]}>
        <View style={[styles.iconCircle, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.titre}</Text>
          <Text style={styles.notifMessage} numberOfLines={3}>{item.message}</Text>
          <Text style={styles.notifDate}>{formatDate(item.date)}</Text>
          {item.type === 'proposition_prix' && (
            <TouchableOpacity
              style={styles.conversezBtn}
              onPress={() => handleConversez(item)}
            >
              <Text style={styles.conversezBtnText}>Conversez</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={60} color={Colors.disabled} />
            <Text style={styles.emptyText}>Aucune notification</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    padding: Spacing.lg,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifUnread: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary + '40',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notifDate: {
    fontSize: FontSize.xs,
    color: Colors.placeholder,
    marginTop: Spacing.xs,
  },
  conversezBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  conversezBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
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
});
