/**
 * Types principaux de l'application SOLUL
 */

// === UTILISATEUR ===
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  photoProfil: string;
  localisation: string;
  type: 'particulier' | 'couturier' | 'influenceur';
  dateInscription: string;
  note: number;         // Note moyenne (1-5)
  nombreVentes: number;
  nombreAchats: number;
}

// === PRODUIT ===
export type EtatProduit = 'Excellent' | 'En bon état';
export type TypeTransaction = 'vente' | 'location';
export type Categorie = 'Robes' | 'Tuniques' | 'Boubous' | 'Tuxedos' | 'Ensembles' | 'Chaussures' | 'Sacs' | 'Accessoires';
export type Genre = 'Homme' | 'Femme' | 'Enfant' | 'Unisexe';

export interface Product {
  id: string;
  vendeurId: string;
  titre: string;
  description: string;
  prix: number;          // En FCFA
  prixLocation?: number; // Prix de location par jour (FCFA)
  categorie: Categorie;
  genre: Genre;
  taille: string;
  matiere?: string;      // Matière tissu (Bazin, Brocart, Wax…)
  localite?: string;     // Localité de l'article
  etat: EtatProduit;
  typeTransaction: TypeTransaction[];
  images: string[];
  marchandage: boolean;   // Le vendeur accepte-t-il la négociation ?
  boost: boolean;         // Article mis en avant ?
  tag?: string;           // Tag court (#bbs, #y4p…)
  datePublication: string;
  vues: number;
}

// === PANIER ===
export interface CartItem {
  produitId: string;
  quantite: number;
  type: TypeTransaction;
  dureeLocation?: number; // En jours, si location
}

// === MESSAGE ===
export interface Message {
  id: string;
  conversationId: string;
  expediteurId: string;
  destinataireId: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
}

export interface Conversation {
  id: string;
  participants: [string, string]; // IDs des deux utilisateurs
  produitId?: string;             // Conversation liée à un produit
  dernierMessage: string;
  dateDernierMessage: string;
}

// === AVIS ===
export interface Avis {
  id: string;
  auteurId: string;
  cibleId: string;       // ID du vendeur ou produit évalué
  note: number;          // 1-5
  commentaire: string;
  photos?: string[];
  date: string;
  reponse?: string;      // Réponse du vendeur
  reponseDate?: string;
}

// === COMMANDE ===
export type StatutCommande = 'en_attente' | 'confirmee' | 'livree' | 'annulee';

export interface Commande {
  id: string;
  acheteurId: string;
  vendeurId: string;
  produits: CartItem[];
  montantTotal: number;
  methodePaiement: 'wave' | 'orange_money' | 'free_money';
  statut: StatutCommande;
  dateCommande: string;
}

// === SIGNALEMENT ===
export interface Signalement {
  id: string;
  auteurId: string;
  cibleType: 'produit' | 'utilisateur';
  cibleId: string;
  raison: string;
  description: string;
  date: string;
}

// === NAVIGATION ===
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Verification: {
    nomUtilisateur: string;
    email: string;
    motDePasse: string;
  };
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Chat: { conversationId: string };
  Checkout: undefined;
  Payment: { items: CartItem[] };
  OrderConfirmed: { commandeId: string; montant: number };
  Notifications: undefined;
  Messages: undefined;
  Profile: { userId: string };
  EditProduct: { productId?: string };
  Search: undefined;
  Reviews: { userId: string };
  MyArticles: undefined;
};

// === TABS ===
export type MainTabParamList = {
  Sell: undefined;
  Boutique: undefined;
  Favorites: undefined;
  Cart: undefined;
  ProfileTab: undefined;
};

// === NOTIFICATION ===
export type NotificationType = 'proposition_prix' | 'paiement_recu' | 'favoris' | 'commande';

export interface Notification {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  lien?: string;
}
