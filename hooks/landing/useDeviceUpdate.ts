import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDevicePayload } from '@/utils/device/deviceUtils';
import apiClient from '@/lib/apiClient';

const DEVICE_SYNCED_KEY = 'device_synced';

const useDeviceUpdate = () => {
  useEffect(() => {
    const syncDevice = async () => {
      try {
        // 1. Schon synchronisiert?
        const alreadySynced = await AsyncStorage.getItem(DEVICE_SYNCED_KEY);
        if (alreadySynced === 'true') return;

        // 2. IDs holen
        const { device_id, install_id } = await getDevicePayload();
        if (!device_id && !install_id) return;

        // 3. API aufrufen
        await apiClient.patch('accounts/update-device/', {
          device_id,
          install_id,
        });

        // 4. Flag setzen — wird nie wieder aufgerufen
        await AsyncStorage.setItem(DEVICE_SYNCED_KEY, 'true');
      } catch (error) {
        // Kein Flag setzen bei Fehler → nächstes Mal erneut versuchen
        console.error('Device sync failed:', error);
      }
    };

    syncDevice();
  }, []);
};

export default useDeviceUpdate;
