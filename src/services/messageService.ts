/**
 * Service messagerie — Persistance des conversations et messages en localStorage
 * Seed automatique depuis les données fake au premier chargement
 */

import { storageService } from './storageService';
import { Conversation, Message } from '../types';
import { fakeConversations, fakeMessages } from '../data';

const CONVERSATIONS_KEY = 'conversations';
const MESSAGES_KEY = 'messages';

export const messageService = {
  /**
   * Initialiser les données (seed) si pas encore fait
   */
  init: async (): Promise<void> => {
    const existing = await storageService.get<Conversation[]>(CONVERSATIONS_KEY);
    if (!existing || existing.length === 0) {
      await storageService.set(CONVERSATIONS_KEY, fakeConversations);
      await storageService.set(MESSAGES_KEY, fakeMessages);
    }
  },

  /**
   * Récupérer une conversation par ID (depuis storage)
   */
  getConversationById: async (conversationId: string): Promise<Conversation | null> => {
    await messageService.init();
    const convs = (await storageService.get<Conversation[]>(CONVERSATIONS_KEY)) || [];
    return convs.find((c) => c.id === conversationId) || null;
  },

  /**
   * Trouver (ou créer) une conversation entre deux utilisateurs.
   * Optionnellement liée à un produit.
   */
  findOrCreateConversation: async (
    userAId: string,
    userBId: string,
    produitId?: string
  ): Promise<Conversation> => {
    await messageService.init();
    const convs = (await storageService.get<Conversation[]>(CONVERSATIONS_KEY)) || [];
    const existing = convs.find((c) => {
      const sameParticipants =
        (c.participants[0] === userAId && c.participants[1] === userBId) ||
        (c.participants[0] === userBId && c.participants[1] === userAId);
      if (!sameParticipants) return false;
      if (!produitId) return true;
      return c.produitId === produitId;
    });
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participants: [userAId, userBId],
      produitId,
      dernierMessage: '',
      dateDernierMessage: new Date().toISOString(),
    };
    convs.push(newConv);
    await storageService.set(CONVERSATIONS_KEY, convs);
    return newConv;
  },

  /**
   * Récupérer toutes les conversations triées par date décroissante
   */
  getConversations: async (): Promise<Conversation[]> => {
    await messageService.init();
    const convs = (await storageService.get<Conversation[]>(CONVERSATIONS_KEY)) || [];
    return convs.sort(
      (a, b) => new Date(b.dateDernierMessage).getTime() - new Date(a.dateDernierMessage).getTime()
    );
  },

  /**
   * Récupérer les messages d'une conversation triés par date croissante
   */
  getMessages: async (conversationId: string): Promise<Message[]> => {
    await messageService.init();
    const allMessages = (await storageService.get<Message[]>(MESSAGES_KEY)) || [];
    return allMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime());
  },

  /**
   * Envoyer un message — persiste le message ET met à jour la conversation
   */
  sendMessage: async (
    conversationId: string,
    expediteurId: string,
    destinataireId: string,
    contenu: string
  ): Promise<Message> => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      expediteurId,
      destinataireId,
      contenu,
      dateEnvoi: new Date().toISOString(),
      lu: false,
    };

    // Persist message
    const allMessages = (await storageService.get<Message[]>(MESSAGES_KEY)) || [];
    allMessages.push(newMsg);
    await storageService.set(MESSAGES_KEY, allMessages);

    // Update conversation dernierMessage
    const convs = (await storageService.get<Conversation[]>(CONVERSATIONS_KEY)) || [];
    const convIndex = convs.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      convs[convIndex].dernierMessage = contenu;
      convs[convIndex].dateDernierMessage = newMsg.dateEnvoi;
      await storageService.set(CONVERSATIONS_KEY, convs);
    }

    return newMsg;
  },

  /**
   * Compte des messages non lus pour une conversation
   */
  getUnreadCount: async (conversationId: string, currentUserId: string): Promise<number> => {
    const allMessages = (await storageService.get<Message[]>(MESSAGES_KEY)) || [];
    return allMessages.filter(
      (m) => m.conversationId === conversationId && m.destinataireId === currentUserId && !m.lu
    ).length;
  },

  /**
   * Marquer tous les messages d'une conversation comme lus
   */
  markAsRead: async (conversationId: string, currentUserId: string): Promise<void> => {
    const allMessages = (await storageService.get<Message[]>(MESSAGES_KEY)) || [];
    let changed = false;
    for (const msg of allMessages) {
      if (msg.conversationId === conversationId && msg.destinataireId === currentUserId && !msg.lu) {
        msg.lu = true;
        changed = true;
      }
    }
    if (changed) {
      await storageService.set(MESSAGES_KEY, allMessages);
    }
  },
};
