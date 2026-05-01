import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';

const INSTALL_KEY = 'install_id';
const DEVICE_KEY = 'device_id';

// ---------------- INSTALL ID ----------------
export const getInstallId = async () => {
  let installId = await AsyncStorage.getItem(INSTALL_KEY);

  if (!installId) {
    installId = Crypto.randomUUID();
    await AsyncStorage.setItem(INSTALL_KEY, installId);
  }

  return installId;
};

// ---------------- DEVICE ID ----------------
export const getDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem(DEVICE_KEY);

  if (deviceId) return deviceId;

  if (Platform.OS === 'android') {
    deviceId = Application.getAndroidId();
  }

  if (Platform.OS === 'ios') {
    deviceId = await Application.getIosIdForVendorAsync();
  }

  if (!deviceId) return null;

  await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  return deviceId;
};

// ---------------- GET BOTH ----------------
export const getDevicePayload = async () => {
  const [device_id, install_id] = await Promise.all([
    getDeviceId(),
    getInstallId(),
  ]);

  return {
    device_id,
    install_id,
  };
};
