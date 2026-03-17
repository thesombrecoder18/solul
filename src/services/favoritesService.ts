import { storageService } from './storageService';

const FAVORITES_KEY = 'favorites'; // string[] product IDs

export const favoritesService = {
  getIds: async (): Promise<string[]> => {
    return (await storageService.get<string[]>(FAVORITES_KEY)) || [];
  },

  isFavorite: async (productId: string): Promise<boolean> => {
    const ids = await favoritesService.getIds();
    return ids.includes(productId);
  },

  add: async (productId: string): Promise<string[]> => {
    const ids = await favoritesService.getIds();
    if (ids.includes(productId)) return ids;
    const next = [...ids, productId];
    await storageService.set(FAVORITES_KEY, next);
    return next;
  },

  remove: async (productId: string): Promise<string[]> => {
    const ids = await favoritesService.getIds();
    const next = ids.filter((id) => id !== productId);
    await storageService.set(FAVORITES_KEY, next);
    return next;
  },

  toggle: async (productId: string): Promise<{ ids: string[]; isFav: boolean }> => {
    const ids = await favoritesService.getIds();
    const isFav = ids.includes(productId);
    const next = isFav ? ids.filter((id) => id !== productId) : [...ids, productId];
    await storageService.set(FAVORITES_KEY, next);
    return { ids: next, isFav: !isFav };
  },
};

