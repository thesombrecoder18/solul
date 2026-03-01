/**
 * Service d'authentification — Simulé en local
 */

import { storageService } from './storageService';
import { User } from '../types';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (userData: Omit<User, 'id' | 'dateInscription' | 'note' | 'nombreVentes' | 'nombreAchats'>): Promise<User | null> => {
    const users = (await storageService.get<User[]>(USERS_KEY)) || [];

    // Vérifier si l'email existe déjà
    if (users.find((u) => u.email === userData.email)) {
      return null;
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      dateInscription: new Date().toISOString(),
      note: 0,
      nombreVentes: 0,
      nombreAchats: 0,
    };

    users.push(newUser);
    await storageService.set(USERS_KEY, users);
    await storageService.set(CURRENT_USER_KEY, newUser);
    return newUser;
  },

  /**
   * Connexion
   */
  login: async (email: string, motDePasse: string): Promise<User | null> => {
    const users = (await storageService.get<User[]>(USERS_KEY)) || [];
    const user = users.find((u) => u.email === email && u.motDePasse === motDePasse);
    if (user) {
      await storageService.set(CURRENT_USER_KEY, user);
      return user;
    }
    return null;
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    await storageService.remove(CURRENT_USER_KEY);
  },

  /**
   * Utilisateur actuellement connecté
   */
  getCurrentUser: async (): Promise<User | null> => {
    return storageService.get<User>(CURRENT_USER_KEY);
  },

  /**
   * Mettre à jour le profil
   */
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User | null> => {
    const users = (await storageService.get<User[]>(USERS_KEY)) || [];
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    await storageService.set(USERS_KEY, users);
    await storageService.set(CURRENT_USER_KEY, users[index]);
    return users[index];
  },
};
