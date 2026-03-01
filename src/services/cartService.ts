/**
 * Service panier — Gestion du panier en local
 */

import { storageService } from './storageService';
import { CartItem } from '../types';

const CART_KEY = 'cart';
const PURCHASED_KEY = 'purchased_items';

export const cartService = {
  /**
   * Récupérer le panier
   */
  getCart: async (): Promise<CartItem[]> => {
    return (await storageService.get<CartItem[]>(CART_KEY)) || [];
  },

  /**
   * Ajouter un article au panier
   */
  addItem: async (item: CartItem): Promise<CartItem[]> => {
    const cart = await cartService.getCart();
    const existingIndex = cart.findIndex((c) => c.produitId === item.produitId && c.type === item.type);

    if (existingIndex >= 0) {
      cart[existingIndex].quantite += item.quantite;
    } else {
      cart.push(item);
    }

    await storageService.set(CART_KEY, cart);
    return cart;
  },

  /**
   * Retirer un article du panier
   */
  removeItem: async (produitId: string): Promise<CartItem[]> => {
    const cart = await cartService.getCart();
    const filtered = cart.filter((c) => c.produitId !== produitId);
    await storageService.set(CART_KEY, filtered);
    return filtered;
  },

  /**
   * Vider le panier
   */
  clearCart: async (): Promise<void> => {
    await storageService.set(CART_KEY, []);
  },

  /**
   * Nombre d'articles dans le panier
   */
  getCount: async (): Promise<number> => {
    const cart = await cartService.getCart();
    return cart.reduce((sum, item) => sum + item.quantite, 0);
  },

  /**
   * Déplacer les articles du panier vers "achetés" (après paiement)
   */
  moveCartToPurchased: async (): Promise<void> => {
    const cart = await cartService.getCart();
    if (cart.length === 0) return;
    const purchased = (await storageService.get<CartItem[]>(PURCHASED_KEY)) || [];
    purchased.push(...cart);
    await storageService.set(PURCHASED_KEY, purchased);
    await storageService.set(CART_KEY, []);
  },

  /**
   * Récupérer les articles achetés (en attente de confirmation de réception)
   */
  getPurchasedItems: async (): Promise<CartItem[]> => {
    return (await storageService.get<CartItem[]>(PURCHASED_KEY)) || [];
  },

  /**
   * Confirmer la réception d'un article acheté (le retirer des purchased)
   */
  confirmReceived: async (produitId: string): Promise<void> => {
    const purchased = (await storageService.get<CartItem[]>(PURCHASED_KEY)) || [];
    const filtered = purchased.filter((c) => c.produitId !== produitId);
    await storageService.set(PURCHASED_KEY, filtered);
  },
};
