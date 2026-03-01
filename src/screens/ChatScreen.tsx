/**
 * Écran Chat — Figma écran 18/31
 * Back + "Message" + more, info utilisateur avec téléphone/video
 * Bulles messages (gauche=reçu, droite=envoyé en brun/doré)
 * Barre de saisie avec emoji, attachment, camera, micro, envoyer
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';
import { Message, RootStackParamList } from '../types';
import { fakeConversations, fakeUsers } from '../data';
import { messageService } from '../services/messageService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CURRENT_USER_ID = 'user_1';

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { conversationId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const conversation = fakeConversations.find((c) => c.id === conversationId);
  const otherUserId = conversation?.participants.find((id) => id !== CURRENT_USER_ID) || '';
  const otherUser = fakeUsers.find((u) => u.id === otherUserId);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    const convMessages = await messageService.getMessages(conversationId);
    setMessages(convMessages);
    // Marquer comme lus
    await messageService.markAsRead(conversationId, CURRENT_USER_ID);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const newMsg = await messageService.sendMessage(
      conversationId,
      CURRENT_USER_ID,
      otherUserId,
      inputText.trim()
    );
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.expediteurId === CURRENT_USER_ID;
    return (
      <View style={[styles.messageBubbleWrapper, isMine ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myText : styles.otherText]}>
            {item.contenu}
          </Text>
        </View>
        <Text style={[styles.messageTime, isMine ? styles.myTime : styles.otherTime]}>
          {formatTime(item.dateEnvoi)}
        </Text>
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
        <Text style={styles.headerTitle}>Message</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* User info bar */}
      {otherUser && (
        <View style={styles.userInfo}>
          <Image source={{ uri: otherUser.photoProfil }} style={styles.userAvatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{otherUser.prenom.toLowerCase()}{otherUser.nom.toLowerCase()}</Text>
            <Text style={styles.userPhone}>{otherUser.telephone}</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="videocam-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="call-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages list */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.inputAction}>
            <Ionicons name="happy-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Écrire ici"
            placeholderTextColor={Colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputAction}>
              <Ionicons name="attach-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputAction}>
              <Ionicons name="camera-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputAction}>
              <Ionicons name="mic-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  messageBubbleWrapper: {
    marginBottom: Spacing.md,
    maxWidth: '75%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  myText: {
    color: Colors.textLight,
  },
  otherText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  myTime: {
    color: Colors.textSecondary,
  },
  otherTime: {
    color: Colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
  },
  inputAction: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    maxHeight: 80,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
});
