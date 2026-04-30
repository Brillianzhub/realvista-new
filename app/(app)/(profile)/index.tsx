import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Linking,
  Share,
  Platform,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import axios from 'axios';
import { formatCurrency } from '@/utils/general/formatCurrency';
import usePortfolioDetail from '@/hooks/portfolio/usePortfolioDetail';
import SubmitReferralModal from '@/components/modals/SubmitReferralModal';
import DeleteAccountModal from '@/components/modals/DeleteAccountModal';
import { useTheme } from '@/context/ThemeContext';
import useWithdrawReferral from '@/hooks/profile/useWithdrawReferral';
import { usePro } from '@/context/ProProvider';

import { restoreProSubscription } from '@/utils/subscriptions/proSubscription';
import { openStoreSubscriptionSettings } from '@/utils/subscriptions/manageSubscription';

export default function Profile() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { colors } = useTheme();

  const { result, refreshing, refreshPortfolioDetails, currency } =
    usePortfolioDetail();

  /*const { isPro, refreshProStatus } = usePro();*/

  const [loading, setLoading] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const { user, setUser, setIsLogged, reloadProfile } = useGlobalContext();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const { withdrawReferralEarnings } = useWithdrawReferral();

  const MIN_WITHDRAWAL = 5000;

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank'>('bank');

  /*const handleRestoreSubscription = async () => {
    try {
      const info = await restoreProSubscription();

      if (info.entitlements.active['pro']) {
        await refreshProStatus();
        Alert.alert('Restored', 'Your Pro subscription has been restored');
      } else {
        Alert.alert('No Subscription', 'No active Pro subscription found');
      }
    } catch {
      Alert.alert('Error', 'Failed to restore purchase');
    }
  };*/

  const netWorth = result?.personal_summary
    ? result.personal_summary.totalCurrentValue +
      (result.personal_summary.totalIncome -
        result.personal_summary.totalExpenses)
    : 0;

  const handleShare = async () => {
    const playStoreUrl =
      'https://play.google.com/store/apps/details?id=com.brillianzhub.realvista';
    const appStoreUrl = 'https://apps.apple.com/app/6745751743';

    const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;

    try {
      await Share.share({
        message: `Manage your properties with Realvista App. Get it now: ${url}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateUs = async () => {
    const playStoreUrl =
      'https://play.google.com/store/apps/details?id=com.brillianzhub.realvista';
    const appStoreUrl = 'https://apps.apple.com/app/6745751743';

    try {
      const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening store:', error);
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      const response = await axios.post(
        'https://www.realvistamanagement.com/accounts/logout/',
      );
      if (response.status === 200) {
        return true;
      } else {
        console.error('Failed to log out');
        return false;
      }
    } catch (error) {
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (user?.auth_provider === 'email') {
        const success = await signOut();
        if (!success) return;
      }
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setIsLogged(false);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Logout Error', error);
    }
  };

  const handleCopyReferralCode = async (): Promise<void> => {
    if (user?.referral_code) {
      await Clipboard.setStringAsync(user.referral_code);
      Alert.alert(
        'Copied!',
        'Referral code has been copied to your clipboard.',
      );
    } else {
      Alert.alert('Error', 'No referral code available.');
    }
  };

  const numericAmount = Number(amount);
  const totalEarnings = user?.total_referral_earnings || 0;
  const canWithdraw = (user?.total_referral_earnings || 0) >= MIN_WITHDRAWAL;
  const canSubmit =
    numericAmount >= MIN_WITHDRAWAL &&
    numericAmount <= totalEarnings &&
    accountDetails.trim().length > 5;

  const handleWithdrawReferral = async () => {
    const numericAmount = Number(amount);
    const totalEarnings = user?.total_referral_earnings || 0;

    if (!numericAmount || isNaN(numericAmount)) {
      Alert.alert('Invalid Amount', 'Enter a valid amount');
      return;
    }

    if (numericAmount < MIN_WITHDRAWAL) {
      Alert.alert(
        'Withdrawal Not Allowed',
        `Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL, 'NGN')}`,
      );
      return;
    }

    if (numericAmount > totalEarnings) {
      Alert.alert(
        'Insufficient Balance',
        `You can withdraw up to ${formatCurrency(totalEarnings, 'NGN')}`,
      );
      return;
    }

    if (!accountDetails.trim()) {
      Alert.alert(
        'Missing Bank Details',
        'Please enter your bank account details',
      );
      return;
    }

    try {
      await withdrawReferralEarnings({
        amount: numericAmount,
        payment_method: paymentMethod,
        account_details: accountDetails,
      });

      Alert.alert('Success', 'Your withdrawal request has been submitted');

      reloadProfile();
      setShowWithdrawModal(false);
      setAmount(0);
      setAccountDetails('');
    } catch (err: any) {
      Alert.alert('Withdrawal Failed', err?.error || 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, isDark && styles.centeredDark]}>
        <ActivityIndicator size="large" color="#FB902E" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshPortfolioDetails}
          tintColor="#358B8B"
        />
      }
    >
      <LinearGradient
        colors={['#efa968', '#358B8B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          {user?.profile ? (
            <Image
              source={{ uri: user.profile.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>
          {user?.first_name || user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={24} color="#358B8B" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Net Worth
            </Text>
          </View>
          <Text
            style={[styles.netWorthAmount, isDark && styles.netWorthAmountDark]}
          >
            {formatCurrency(netWorth, currency)}
          </Text>
          <Text
            style={[
              styles.netWorthSubtext,
              isDark && styles.netWorthSubtextDark,
            ]}
          >
            Total Value + Income - Expenses
          </Text>
        </View>

        {/*
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={24} color="#358B8B" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Subscription
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (!isPro) router.push('/(pro)');
            }}
            disabled={isPro}
          >
            <Ionicons
              name="star-outline"
              size={20}
              color={isDark ? '#E5E7EB' : '#6B7280'}
            />
            <Text
              style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
            >
              {isPro ? 'Pro Membership Active' : 'Upgrade to Pro'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#9CA3AF' : '#D1D5DB'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRestoreSubscription}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={isDark ? '#E5E7EB' : '#6B7280'}
            />
            <Text
              style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
            >
              Restore Purchase
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? '#9CA3AF' : '#D1D5DB'}
            />
          </TouchableOpacity>

          {isPro && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={openStoreSubscriptionSettings}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={isDark ? '#E5E7EB' : '#6B7280'}
              />
              <Text
                style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
              >
                Manage Billing
              </Text>
              <Ionicons
                name="open-outline"
                size={18}
                color={isDark ? '#9CA3AF' : '#D1D5DB'}
              />
            </TouchableOpacity>
          )}
        </View> */}

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={24} color="#358B8B" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Referral Details
            </Text>
          </View>

          {user?.referrer && (
            <View style={styles.referralRow}>
              <Text
                style={[
                  styles.referralLabel,
                  isDark && styles.referralLabelDark,
                ]}
              >
                Referrer
              </Text>
              <Text
                style={[
                  styles.referralValue,
                  isDark && styles.referralValueDark,
                ]}
              >
                {user?.referrer}
              </Text>
            </View>
          )}

          <View style={styles.referralRow}>
            <Text
              style={[styles.referralLabel, isDark && styles.referralLabelDark]}
            >
              Referral Code
            </Text>
            <TouchableOpacity
              onPress={handleCopyReferralCode}
              style={styles.referralCodeContainer}
            >
              <Text style={styles.referralCode}>{user?.referral_code}</Text>
              <Ionicons name="copy-outline" size={20} color="#358B8B" />
            </TouchableOpacity>
          </View>

          <View style={styles.referralRow}>
            <Text
              style={[styles.referralLabel, isDark && styles.referralLabelDark]}
            >
              Referrals
            </Text>
            <Text
              style={[styles.referralValue, isDark && styles.referralValueDark]}
            >
              {user?.referred_users_count || 0}
            </Text>
          </View>

          <View style={styles.referralRow}>
            <Text
              style={[styles.referralLabel, isDark && styles.referralLabelDark]}
            >
              Earnings
            </Text>
            <Text
              style={[styles.referralValue, isDark && styles.referralValueDark]}
            >
              {formatCurrency(user?.total_referral_earnings || 0, 'NGN')}
            </Text>
          </View>

          <View style={styles.referralRow}>
            <Text
              style={[styles.referralLabel, isDark && styles.referralLabelDark]}
            >
              Withdraw Referral Earning
            </Text>

            <TouchableOpacity
              style={[
                styles.withdrawButton,
                { backgroundColor: canWithdraw ? '#358B8B' : '#9CA3AF' },
                !canWithdraw && { opacity: 0.5 },
              ]}
              disabled={!canWithdraw}
              onPress={() => setShowWithdrawModal(true)}
            >
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          {!user?.referrer && (
            <TouchableOpacity
              style={[
                styles.referralButton,
                isDark && styles.referralButtonDark,
              ]}
              onPress={() => setShowReferralModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="gift" size={20} color="#FFFFFF" />
              <Text style={styles.referralButtonText}>Enter Referral Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={[
          styles.card,
          isDark && styles.cardDark,
          { marginHorizontal: 16 },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="settings-outline" size={24} color="#358B8B" />
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            Settings
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(auth)/update-profile')}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            Update Profile
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(auth)/change-password')}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            Change Password
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(app)/(settings)')}
        >
          <Ionicons
            name="cash-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            Set Currency
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowDeleteAccountModal(true)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={[styles.menuItemText, styles.deleteAccountText]}>
            Delete Account
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          { marginHorizontal: 20 },
          isDark && styles.cardDark,
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#358B8B"
          />
          <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
            About
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Linking.openURL('https://www.realvistaproperties.com/about')
          }
        >
          <Ionicons
            name="business-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            About Us
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Linking.openURL('https://realvistaproperties.com/contact')
          }
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            Contact Us
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
          <Ionicons
            name="share-social-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            Share App
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleRateUs}>
          <Ionicons
            name="star-outline"
            size={20}
            color={isDark ? '#E5E7EB' : '#6B7280'}
          />
          <Text
            style={[styles.menuItemText, isDark && styles.menuItemTextDark]}
          >
            Rate Us
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#9CA3AF' : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.signOutButton,
          isDark && styles.signOutButtonDark,
          { borderColor: colors.border.default },
        ]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
          Realvista Properties
        </Text>
        <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
          Version 1.0.6
        </Text>
      </View>
      <SubmitReferralModal
        visible={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      <DeleteAccountModal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
      />

      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.background.primary },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Withdraw Referral Earnings
              </Text>
              <Pressable onPress={() => setShowWithdrawModal(false)}>
                <Text
                  style={[styles.closeText, { color: colors.text.primary }]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            {/* Balance */}
            <Text style={[styles.balanceText, { color: colors.text.primary }]}>
              Available:{' '}
              {formatCurrency(user?.total_referral_earnings || 0, 'NGN')}
            </Text>

            {/* Amount */}
            <TextInput
              value={amount.toString()}
              onChangeText={(text) => setAmount(text === '' ? 0 : Number(text))}
              keyboardType="numeric"
              placeholder="Enter amount"
              style={[
                styles.input,
                {
                  color: colors.text.primary,
                  backgroundColor: colors.background.secondary,
                },
              ]}
            />

            {/* Account details */}
            <TextInput
              value={accountDetails}
              onChangeText={setAccountDetails}
              placeholder="Bank name | Account number | Account name"
              placeholderTextColor={colors.text.primary}
              multiline
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text.primary,
                  backgroundColor: colors.background.secondary,
                },
              ]}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && { opacity: 0.5 }]}
              disabled={!canSubmit || loading}
              onPress={handleWithdrawReferral}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  centeredDark: {
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  loadingTextDark: {
    color: '#9CA3AF',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 16,
    marginTop: -20,
  },
  deleteAccountText: {
    color: '#EF4444',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardTitleDark: {
    color: '#F9FAFB',
  },
  netWorthAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FB902E',
    marginBottom: 4,
  },
  netWorthAmountDark: {
    color: '#FB902E',
  },
  netWorthSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  netWorthSubtextDark: {
    color: '#9CA3AF',
  },
  referralRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  referralLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  referralLabelDark: {
    color: '#9CA3AF',
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referralCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FB902E',
  },
  referralValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  referralValueDark: {
    color: '#F9FAFB',
  },

  withdrawButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuItemTextDark: {
    color: '#E5E7EB',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutButtonDark: {
    backgroundColor: '#1F2937',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerTextDark: {
    color: '#6B7280',
  },

  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FB902E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    shadowColor: '#FB902E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  referralButtonDark: {
    backgroundColor: '#EA580C',
  },
  referralButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  closeText: {
    fontSize: 20,
    fontWeight: '600',
  },

  balanceText: {
    marginBottom: 12,
    color: '#4b5563',
  },

  submitButton: {
    marginTop: 16,
    backgroundColor: '#358B8B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
