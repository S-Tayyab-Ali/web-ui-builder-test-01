import { User, Favorite, UserLocation } from './types';

const USER_KEY = 'food_finder_user';
const FAVORITES_KEY = 'food_finder_favorites';
const LOCATION_KEY = 'food_finder_location';

export const storage = {
  // User management
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },

  // Favorites management
  getFavorites: (userId: string): Favorite[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`${FAVORITES_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  addFavorite: (userId: string, restaurantId: string): Favorite => {
    const favorites = storage.getFavorites(userId);
    const newFavorite: Favorite = {
      id: `fav_${Date.now()}`,
      userId,
      restaurantId,
      createdDate: new Date().toISOString(),
    };
    favorites.push(newFavorite);
    localStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(favorites));
    return newFavorite;
  },

  removeFavorite: (userId: string, restaurantId: string) => {
    const favorites = storage.getFavorites(userId);
    const updated = favorites.filter(f => f.restaurantId !== restaurantId);
    localStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(updated));
  },

  isFavorite: (userId: string, restaurantId: string): boolean => {
    const favorites = storage.getFavorites(userId);
    return favorites.some(f => f.restaurantId === restaurantId);
  },

  // Location management
  getLocation: (): UserLocation | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(LOCATION_KEY);
    return data ? JSON.parse(data) : null;
  },

  setLocation: (location: UserLocation) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  },

  clearLocation: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOCATION_KEY);
  },

  // Clear all data
  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};
