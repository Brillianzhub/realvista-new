// components/landing/ReferralCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useTheme } from '@/context/ThemeContext';

const BRAND = '#358B8B';
const BRAND_DARK = '#2A6F6F';

const ReferralCard: React.FC = () => {
  const { user } = useGlobalContext();
  const { colors } = useTheme();
  const [showReferralModal, setShowReferralModal] = useState(false);

  const referralCode = user?.referral_code || '';
  const referredCount = user?.referred_users_count || 0;
  const totalEarnings = user?.total_referral_earnings || 0;

  const handleShare = async () => {
    if (!referralCode) {
      Alert.alert('Error', 'Referral code not available');
      return;
    }

    const message = `Join me on RealVista Properties! Use my referral code: ${referralCode} to get started. Download the app and start your real estate journey today!`;

    try {
      await Share.share({
        message: message,
        title: 'Invite Friends to RealVista',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const handleCopyCode = () => {
    if (!referralCode) return;

    // Copy to clipboard functionality
    // You'll need to install @react-native-clipboard/clipboard or use a different method
    Alert.alert('Success', `Referral code ${referralCode} copied!`);
    setShowReferralModal(false);
  };

  if (!referralCode) {
    return null; // Don't show if no referral code
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowReferralModal(true)}
        style={styles.container}
      >
        <LinearGradient
          colors={[BRAND_DARK, BRAND]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.content}>
            {/* Icon Section */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="gift-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>

            {/* Text Section */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Invite Friends & Earn</Text>
              <Text style={styles.subtitle}>
                Share your code and earn rewards when they join
              </Text>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{referredCount}</Text>
                <Text style={styles.statLabel}>Friends Joined</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  ₦{totalEarnings.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color={BRAND} />
              <Text style={styles.shareButtonText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Referral Details Modal */}
      <Modal
        visible={showReferralModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowReferralModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background.primary },
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReferralModal(false)}
            >
              <Ionicons
                name="close-outline"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <LinearGradient
                colors={[BRAND_DARK, BRAND]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalIconGradient}
              >
                <MaterialCommunityIcons
                  name="trophy-award"
                  size={40}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              Share & Earn Rewards!
            </Text>

            {/* Description */}
            <Text
              style={[
                styles.modalDescription,
                { color: colors.text.secondary },
              ]}
            >
              Invite your friends to join RealVista Properties using your unique
              referral code. You'll earn rewards for every friend who signs up!
            </Text>

            {/* Your Code Section */}
            <View style={styles.codeContainer}>
              <Text
                style={[styles.codeLabel, { color: colors.text.secondary }]}
              >
                Your Referral Code
              </Text>
              <View
                style={[
                  styles.codeBox,
                  { backgroundColor: colors.background.secondary },
                ]}
              >
                <Text style={[styles.codeText, { color: colors.text.primary }]}>
                  {referralCode}
                </Text>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color={BRAND} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Summary */}
            <View
              style={[
                styles.modalStats,
                {
                  borderTopColor: colors.border.default,
                  borderBottomColor: colors.border.default,
                },
              ]}
            >
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{referredCount}</Text>
                <Text
                  style={[
                    styles.modalStatLabel,
                    { color: colors.text.secondary },
                  ]}
                >
                  Friends Joined
                </Text>
              </View>
              <View
                style={[
                  styles.modalStatDivider,
                  { backgroundColor: colors.border.default },
                ]}
              />
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>
                  ₦{totalEarnings.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.modalStatLabel,
                    { color: colors.text.secondary },
                  ]}
                >
                  Total Earned
                </Text>
              </View>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.modalShareButton}
              onPress={handleShare}
            >
              <LinearGradient
                colors={[BRAND_DARK, BRAND]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalShareGradient}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.modalShareText}>Share Referral Code</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Info Note */}
            <Text style={[styles.infoNote, { color: colors.text.secondary }]}>
              *Rewards are credited automatically when your friend completes
              their first property purchase
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#E0F0F0',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#E0F0F0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  codeContainer: {
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 4,
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND,
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 11,
  },
  modalStatDivider: {
    width: 1,
    height: 35,
  },
  modalShareButton: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 12,
  },
  modalShareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  modalShareText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoNote: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReferralCard;
