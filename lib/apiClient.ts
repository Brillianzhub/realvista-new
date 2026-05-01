// lib/apiClient.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://www.realvistamanagement.com/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

apiClient.interceptors.request.use(
  async (config) => {
    if (!authToken) {
      authToken = await AsyncStorage.getItem('authToken');
    }

    if (authToken) {
      config.headers.Authorization = `Token ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
