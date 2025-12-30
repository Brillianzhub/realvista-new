import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '@/components/auth/FormInput';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { colors } = useTheme();

  const handleResetRequest = async (): Promise<void> => {
    if (!email) {
      Alert.alert('Missing Information', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://www.realvistamanagement.com/accounts/request-password-reset/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData: { error?: string } = await response.json();
        throw new Error(
          errorData.error || 'Failed to send reset email. Please try again.'
        );
      }

      // Show success message before navigation
      Alert.alert(
        'Email Sent!',
        'A password reset link has been sent to your email address.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace({
                pathname: '/verify-otp',
                params: { email },
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      Alert.alert(
        'Request Failed',
        error.message ||
          'Something went wrong. Please check your email and try again.',
        [{ text: 'Try Again' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.safeArea, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={40} color="#FB902E" />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            Reset Password
          </Text>

          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Enter your email address and we'll send you a link to reset your
            password
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <FormInput
            placeholder="your.email@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!email || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleResetRequest}
            disabled={!email || isSubmitting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FB902E', '#FFA726']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Alternative Options */}
          <View style={styles.alternativesContainer}>
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={handleBack}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.alternativeText}>Back to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={() => router.push('/sign-up')}
            >
              <Ionicons name="person-add-outline" size={20} color="#6B7280" />
              <Text style={styles.alternativeText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View
            style={[
              styles.helpCard,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#3B82F6"
            />
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.text.primary }]}>
                Can't access your email?
              </Text>
              <Text style={[styles.helpText, { color: colors.text.secondary }]}>
                Contact our support team at support@realvistaproperties.com for
                assistance
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FB902E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    maxWidth: 300,
  },
  formContainer: {
    gap: 24,
  },
  button: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FB902E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Abel-Regular',
  },
  alternativesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    flex: 1,
    marginHorizontal: 6,
  },
  alternativeText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginTop: 24,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default ForgotPassword;
