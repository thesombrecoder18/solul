/**
 * Service de stockage local — Abstraction d'AsyncStorage
 * Toute lecture/écriture de données passe par ce service.
 * Quand un backend sera en place, seul ce fichier changera.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@solul_';

export const storageService = {
  /**
   * Récupérer une valeur
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[StorageService] Erreur lecture "${key}":`, error);
      return null;
    }
  },

  /**
   * Enregistrer une valeur
   */
  set: async <T>(key: string, value: T): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Erreur écriture "${key}":`, error);
      return false;
    }
  },

  /**
   * Supprimer une clé
   */
  remove: async (key: string): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error(`[StorageService] Erreur suppression "${key}":`, error);
      return false;
    }
  },

  /**
   * Vider tout le stockage SOLUL
   */
  clear: async (): Promise<boolean> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const solulKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(solulKeys);
      return true;
    } catch (error) {
      console.error('[StorageService] Erreur clear:', error);
      return false;
    }
  },
};
