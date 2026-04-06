import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// These IDs must match RevenueCat entitlement IDs
export const PRO_ENTITLEMENT_ID = 'pro';

export function initPurchases(): void {
  Purchases.setLogLevel(
    __DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.ERROR
  );

  const extra = Constants.expoConfig?.extra;

  const apiKey =
    Platform.OS === 'ios'
      ? extra?.revenueCatIosKey
      : extra?.revenueCatAndroidKey;

  if (!apiKey) {
    console.error('RevenueCat API key missing', { platform: Platform.OS });
    return; // 🚨 don’t crash the app
  }

  Purchases.configure({ apiKey });
}

export async function getProPackages(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();

  if (!offerings.current || offerings.current.availablePackages.length === 0) {
    throw new Error('No Pro subscription offerings found');
  }

  return offerings.current.availablePackages;
}

export async function subscribeToPro(
  pkg: PurchasesPackage
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);

  return customerInfo;
}

export async function restoreProSubscription(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}

export async function isProUser(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();

  return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}

export function canManagePortfolio(
  propertyCount: number,
  isPro: boolean
): boolean {
  return isPro || propertyCount <= 5;
}

export function canListProperty(isPro: boolean): boolean {
  return isPro;
}
