import { Platform, Linking } from 'react-native';

export function openStoreSubscriptionSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  } else {
    Linking.openURL('https://play.google.com/store/account/subscriptions');
  }
}
