/**
 * Écran Liste des Messages — Figma écran 17/31
 * X close + "Messages" + icône
 * Liste conversations avec avatar, nom, dernier message, heure, badge non-lu
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Conversation, RootStackParamList } from '../types';
import { fakeUsers } from '../data';
import { messageService } from '../services/messageService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CURRENT_USER_ID = 'user_1'; // Binta est l'utilisateur connecté par défaut

export default function MessagesListScreen() {
  const navigation = useNavigation<Nav>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    const convs = await messageService.getConversations();
    setConversations(convs);
    // Charger les compteurs de non-lus
    const counts: Record<string, number> = {};
    for (const conv of convs) {
      counts[conv.id] = await messageService.getUnreadCount(conv.id, CURRENT_USER_ID);
    }
    setUnreadCounts(counts);
  };

  const getOtherUser = (conv: Conversation) => {
    const otherId = conv.participants.find((id) => id !== CURRENT_USER_ID) || conv.participants[0];
    return fakeUsers.find((u) => u.id === otherId);
  };

  const getUnreadCount = (conv: Conversation): number => {
    return unreadCounts[conv.id] || 0;
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);
    const unread = getUnreadCount(item);

    return (
      <TouchableOpacity
        style={styles.convItem}
        onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: otherUser?.photoProfil || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
          style={styles.avatar}
        />
        <View style={styles.convInfo}>
          <View style={styles.convHeader}>
            <Text style={[styles.convName, unread > 0 && styles.convNameBold]}>
              {otherUser ? `${otherUser.prenom} ${otherUser.nom}` : 'Utilisateur'}
            </Text>
            <Text style={styles.convTime}>{formatTime(item.dateDernierMessage)}</Text>
          </View>
          <View style={styles.convBottom}>
            <Text style={[styles.convMessage, unread > 0 && styles.convMessageBold]} numberOfLines={1}>
              {item.dernierMessage}
            </Text>
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.textPrimary} />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={60} color={Colors.disabled} />
            <Text style={styles.emptyText}>Aucun message</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
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
    paddingVertical: Spacing.sm,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    marginRight: Spacing.md,
  },
  convInfo: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  convNameBold: {
    fontWeight: '700',
  },
  convTime: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  convBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  convMessageBold: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 80,
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
