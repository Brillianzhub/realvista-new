import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';
const REFRESH_KEY = 'authRefreshToken';

export const tokenStore = {
  async get(): Promise<string | null> {
    try {
      const secure = await SecureStore.getItemAsync(TOKEN_KEY);
      if (secure) return secure;
      // Migrate legacy AsyncStorage token to SecureStore on first use
      const legacy = await AsyncStorage.getItem(TOKEN_KEY);
      if (legacy) {
        await SecureStore.setItemAsync(TOKEN_KEY, legacy);
        await AsyncStorage.removeItem(TOKEN_KEY);
        return legacy;
      }
      return null;
    } catch {
      // Fallback for web/simulator where SecureStore is unavailable
      return AsyncStorage.getItem(TOKEN_KEY);
    }
  },

  async set(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await AsyncStorage.removeItem(TOKEN_KEY); // clean up legacy key
    } catch {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
    await AsyncStorage.removeItem(TOKEN_KEY);
    await this.clearRefresh();
  },

  async getRefresh(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_KEY);
    } catch {
      return AsyncStorage.getItem(REFRESH_KEY);
    }
  },

  async setRefresh(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_KEY, token);
    } catch {
      await AsyncStorage.setItem(REFRESH_KEY, token);
    }
  },

  async clearRefresh(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_KEY);
    } catch {}
    await AsyncStorage.removeItem(REFRESH_KEY);
  },
};
