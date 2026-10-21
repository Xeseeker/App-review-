import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@appora:favorites';
export async function loadFavorites() { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
export async function isFavorite(id) { return (await loadFavorites()).some((app) => app.id === id); }
export async function toggleFavorite(app) { const favorites = await loadFavorites(); const exists = favorites.some((item) => item.id === app.id); const next = exists ? favorites.filter((item) => item.id !== app.id) : [app, ...favorites]; await AsyncStorage.setItem(KEY, JSON.stringify(next)); return !exists; }
export async function clearFavorites() { await AsyncStorage.removeItem(KEY); }
