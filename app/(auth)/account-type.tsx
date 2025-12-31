// AccountType.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AccountType: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleAccountSelection = (type: 'basic' | 'agent') => {
    if (type === 'basic') {
      router.push('/(auth)/sign-up');
    } else {
      router.push('/(auth)/signupAgent');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Choose Your Account Type
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Select the account that best fits your needs
        </Text>
      </View>

      {/* Account Cards */}
      <View style={styles.cardsContainer}>
        {/* Basic Account Card */}
        <TouchableOpacity
          style={[
            styles.card,
            {
              borderColor: colors.border.default,
              backgroundColor: colors.background.secondary,
            },
          ]}
          onPress={() => handleAccountSelection('basic')}
          activeOpacity={0.9}
        >
          <View
            style={[styles.cardIconContainer, { backgroundColor: '#FB902E20' }]}
          >
            <Ionicons name="person-outline" size={28} color="#FB902E" />
          </View>

          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Basic Account
          </Text>

          <Text
            style={[styles.cardDescription, { color: colors.text.secondary }]}
          >
            Perfect for finding properties and managing your personal real
            estate needs
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#358B8B" />
              <Text
                style={[styles.featureText, { color: colors.text.secondary }]}
              >
                Browse properties
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#358B8B" />
              <Text
                style={[styles.featureText, { color: colors.text.secondary }]}
              >
                Save favorites
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#358B8B" />
              <Text
                style={[styles.featureText, { color: colors.text.secondary }]}
              >
                Contact agents
              </Text>
            </View>
          </View>

          <View style={[styles.cardButton, { backgroundColor: '#FB902E' }]}>
            <Text style={styles.cardButtonText}>Continue as Basic User</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* Agent Account Card */}
        <TouchableOpacity
          style={[
            styles.card,
            {
              borderColor: colors.border.default,
              backgroundColor: colors.background.secondary,
            },
          ]}
          onPress={() => handleAccountSelection('agent')}
          activeOpacity={0.9}
        >
          <View
            style={[styles.cardIconContainer, { backgroundColor: '#358B8B20' }]}
          >
            <Ionicons name="business-outline" size={28} color="#358B8B" />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Professional</Text>
          </View>

          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Agent Account
          </Text>

          <Text
            style={[styles.cardDescription, { color: colors.text.secondary }]}
          >
            For real estate professionals to list properties and manage clients
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#358B8B" />
              <Text
                style={[styles.featureText, { color: colors.text.secondary }]}
              >
                List properties
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#358B8B" />
              <Text
                style={[styles.featureText, { color: colors.text.secondary }]}
              >
                Manage clients
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#358B8B" />
              <Text
                style={[styles.featureText, { color: colors.text.secondary }]}
              >
                Analytics dashboard
              </Text>
            </View>
          </View>

          <View style={[styles.cardButton, styles.agentCardButton]}>
            <Text style={styles.agentCardButtonText}>Continue as Agent</Text>
            <Ionicons name="arrow-forward" size={20} color="#358B8B" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>
          You can switch account types later in settings
        </Text>
      </View>
    </ScrollView>
  );
};

export default AccountType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#358B8B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.9,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  agentCardButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#358B8B',
  },
  cardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  agentCardButtonText: {
    color: '#358B8B',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  helpLink: {
    color: '#358B8B',
    fontWeight: '600',
  },
});
