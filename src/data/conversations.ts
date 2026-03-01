/**
 * Données fake — Conversations et messages
 */

import { Conversation, Message } from '../types';

export const fakeConversations: Conversation[] = [
  {
    id: 'conv_1',
    participants: ['user_1', 'user_4'],
    produitId: 'prod_2',
    dernierMessage: 'Meun nako am pour 10000?',
    dateDernierMessage: '2026-03-01T00:25:00',
  },
  {
    id: 'conv_2',
    participants: ['user_1', 'user_5'],
    produitId: 'prod_6',
    dernierMessage: 'Je ne suis pas déçue de mon achat en tous ...',
    dateDernierMessage: '2026-02-28T22:20:00',
  },
  {
    id: 'conv_3',
    participants: ['user_1', 'user_6'],
    produitId: 'prod_3',
    dernierMessage: "D'accord🤝",
    dateDernierMessage: '2026-02-28T10:45:00',
  },
  {
    id: 'conv_4',
    participants: ['user_1', 'user_7'],
    dernierMessage: 'Merci pour votre achat !',
    dateDernierMessage: '2026-02-27T13:10:00',
  },
];

export const fakeMessages: Message[] = [
  // Conversation 1 : Binta <-> Bilal
  {
    id: 'msg_1_1',
    conversationId: 'conv_1',
    expediteurId: 'user_4',
    destinataireId: 'user_1',
    contenu: 'Bonjour, j\'ai vu votre article et je suis intéressé',
    dateEnvoi: '2026-03-01T00:20:00',
    lu: true,
  },
  {
    id: 'msg_1_2',
    conversationId: 'conv_1',
    expediteurId: 'user_4',
    destinataireId: 'user_1',
    contenu: 'voir cette annonce et je suis interessé',
    dateEnvoi: '2026-03-01T00:24:00',
    lu: true,
  },
  {
    id: 'msg_1_3',
    conversationId: 'conv_1',
    expediteurId: 'user_4',
    destinataireId: 'user_1',
    contenu: 'Meun nako am pour 10000?',
    dateEnvoi: '2026-03-01T00:25:00',
    lu: false,
  },
  {
    id: 'msg_1_4',
    conversationId: 'conv_1',
    expediteurId: 'user_1',
    destinataireId: 'user_4',
    contenu: 'Merci de m\'avoir contacté 😊',
    dateEnvoi: '2026-03-01T15:14:00',
    lu: true,
  },
  // Conversation 2 : Binta <-> Oumy
  {
    id: 'msg_2_1',
    conversationId: 'conv_2',
    expediteurId: 'user_5',
    destinataireId: 'user_1',
    contenu: 'Je ne suis pas déçue de mon achat en tous cas merci beaucoup !',
    dateEnvoi: '2026-02-28T22:20:00',
    lu: false,
  },
  // Conversation 3 : Binta <-> Baye Modou
  {
    id: 'msg_3_1',
    conversationId: 'conv_3',
    expediteurId: 'user_6',
    destinataireId: 'user_1',
    contenu: "D'accord🤝",
    dateEnvoi: '2026-02-28T10:45:00',
    lu: false,
  },
  // Conversation 4 : Binta <-> Naffy
  {
    id: 'msg_4_1',
    conversationId: 'conv_4',
    expediteurId: 'user_7',
    destinataireId: 'user_1',
    contenu: 'Merci pour votre achat !',
    dateEnvoi: '2026-02-27T13:10:00',
    lu: true,
  },
];
