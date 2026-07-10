import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';

const INSTALL_KEY = 'install_id';
const DEVICE_KEY = 'device_id';

export const getInstallId = async () => {
  try {
    let installId = await AsyncStorage.getItem(INSTALL_KEY);

    if (!installId) {
      installId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString() + Date.now().toString(),
      );
      await AsyncStorage.setItem(INSTALL_KEY, installId);
    }

    return installId;
  } catch (e) {
    console.log('Install ID error:', e);
    return null;
  }
};

export const getDeviceId = async () => {
  try {
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
  } catch (e) {
    console.log('Device ID error:', e);
    return null;
  }
};

export const getDevicePayload = async () => {
  try {
    const [device_id, install_id] = await Promise.all([
      getDeviceId(),
      getInstallId(),
    ]);

    return { device_id, install_id };
  } catch (e) {
    console.log('Payload error:', e);
    return { device_id: null, install_id: null };
  }
};
