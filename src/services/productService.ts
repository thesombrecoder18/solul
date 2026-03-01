/**
 * Service produits — CRUD simulé en local
 */

import { storageService } from './storageService';
import { Product, Categorie, Genre } from '../types';

const PRODUCTS_KEY = 'products';

export interface ProductFilters {
  categorie?: Categorie;
  genre?: Genre;
  prixMin?: number;
  prixMax?: number;
  taille?: string;
  etat?: string;
  recherche?: string;
  typeTransaction?: 'vente' | 'location';
}

export const productService = {
  /**
   * Récupérer tous les produits
   */
  getAll: async (): Promise<Product[]> => {
    return (await storageService.get<Product[]>(PRODUCTS_KEY)) || [];
  },

  /**
   * Récupérer un produit par ID
   */
  getById: async (id: string): Promise<Product | null> => {
    const products = await productService.getAll();
    return products.find((p) => p.id === id) || null;
  },

  /**
   * Recherche avec filtres
   */
  search: async (filters: ProductFilters): Promise<Product[]> => {
    let products = await productService.getAll();

    if (filters.categorie) {
      products = products.filter((p) => p.categorie === filters.categorie);
    }
    if (filters.genre) {
      products = products.filter((p) => p.genre === filters.genre);
    }
    if (filters.prixMin !== undefined) {
      products = products.filter((p) => p.prix >= filters.prixMin!);
    }
    if (filters.prixMax !== undefined) {
      products = products.filter((p) => p.prix <= filters.prixMax!);
    }
    if (filters.taille) {
      products = products.filter((p) => p.taille === filters.taille);
    }
    if (filters.etat) {
      products = products.filter((p) => p.etat === filters.etat);
    }
    if (filters.typeTransaction) {
      products = products.filter((p) => p.typeTransaction.includes(filters.typeTransaction!));
    }
    if (filters.recherche) {
      const query = filters.recherche.toLowerCase();
      products = products.filter(
        (p) =>
          p.titre.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return products;
  },

  /**
   * Créer un article
   */
  create: async (productData: Omit<Product, 'id' | 'datePublication' | 'vues'>): Promise<Product> => {
    const products = await productService.getAll();
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      datePublication: new Date().toISOString(),
      vues: 0,
    };
    products.push(newProduct);
    await storageService.set(PRODUCTS_KEY, products);
    return newProduct;
  },

  /**
   * Mettre à jour un article
   */
  update: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const products = await productService.getAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates };
    await storageService.set(PRODUCTS_KEY, products);
    return products[index];
  },

  /**
   * Supprimer un article
   */
  remove: async (id: string): Promise<boolean> => {
    const products = await productService.getAll();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    await storageService.set(PRODUCTS_KEY, filtered);
    return true;
  },

  /**
   * Produits boostés (mis en avant)
   */
  getBoosted: async (): Promise<Product[]> => {
    const products = await productService.getAll();
    return products.filter((p) => p.boost);
  },

  /**
   * Produits d'un vendeur
   */
  getByVendeur: async (vendeurId: string): Promise<Product[]> => {
    const products = await productService.getAll();
    return products.filter((p) => p.vendeurId === vendeurId);
  },
};
