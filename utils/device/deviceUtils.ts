import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getDeviceId = async () => {
  if (Platform.OS === 'android') {
    return Application.getAndroidId(); // ✅ sync
  }

  if (Platform.OS === 'ios') {
    return await Application.getIosIdForVendorAsync(); // ✅ async
  }

  return null;
};
