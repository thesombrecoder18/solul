/**
 * Données fake — Notifications
 */

import { Notification } from '../types';

export const fakeNotifications: Notification[] = [
  {
    id: 'notif_1',
    type: 'proposition_prix',
    titre: 'Proposition de prix',
    message: '@bilalman08 vous a fait une proposition de prix sur un article (#y4p)',
    date: '2026-03-01T00:30:00',
    lu: false,
    lien: 'conv_1',
  },
  {
    id: 'notif_2',
    type: 'paiement_recu',
    titre: 'Paiement reçu',
    message:
      'Votre client confirme avoir reçu son article vous venez donc de recevoir une somme de 15 000 fcfa provenant de l\'achat de l\'article #bbs',
    date: '2026-02-28T14:00:00',
    lu: true,
  },
  {
    id: 'notif_3',
    type: 'favoris',
    titre: 'Favoris',
    message: '23 personnes ont mis votre article #bbs dans leurs favoris',
    date: '2026-02-28T10:00:00',
    lu: true,
  },
];
