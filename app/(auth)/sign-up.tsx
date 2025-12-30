import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  Linking,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import images from '@/constants/images';
import { useGlobalContext } from '../../context/GlobalProvider';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import AppleLogin from '@/components/auth/AppleLogin';
import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 700;

// Type definitions
interface FormData {
  name: string;
  first_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

interface Errors {
  password: string;
  confirmPassword: string;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface TokenData {
  token: string;
}

interface UserData {
  id: number;
  email: string;
  name: string;
  first_name: string;
  auth_provider: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  profile: any;
  subscription: any;
  referral_code: string;
  referrer: any;
  referred_users_count: number;
  total_referral_earnings: string;
  preference: any;
  groups: any[];
}

interface GlobalContextType {
  setUser: (user: any) => void;
  setIsLogged: (isLogged: boolean) => void;
}

const RegistrationForm = () => {
  const { setUser, setIsLogged } = useGlobalContext() as GlobalContextType;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { colors } = useTheme();

  const [form, setForm] = useState({
    name: '',
    first_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    agreedToTerms: '',
  });

  const validateForm = (form: FormData): ValidationResult => {
    const { email, password, confirmPassword, agreedToTerms } = form;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/;

    if (!email.trim()) {
      return { valid: false, message: 'Email is required.' };
    }

    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }

    if (!password.trim()) {
      return { valid: false, message: 'Password is required.' };
    }

    if (!strongPasswordRegex.test(password)) {
      return {
        valid: false,
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      };
    }

    if (!confirmPassword.trim()) {
      return { valid: false, message: 'Confirm password is required.' };
    }

    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match.' };
    }

    if (!agreedToTerms) {
      return {
        valid: false,
        message: 'Please agree to the terms and privacy policy.',
      };
    }

    return { valid: true };
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    const validation = validateForm(form);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://www.realvistamanagement.com/accounts/register_user/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            first_name: form.first_name,
            email: form.email,
            password: form.password,
            auth_provider: 'email',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      const result = await response.json();

      const tokenResponse = await fetch(
        'https://www.realvistamanagement.com/portfolio/api-token-auth/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: form.email,
            password: form.password,
          }),
        }
      );

      const tokenData: TokenData = await tokenResponse.json();

      if (!tokenData.token) {
        throw new Error('Authentication token not provided');
      }

      await AsyncStorage.setItem('authToken', tokenData.token);

      const userResponse = await fetch(
        'https://www.realvistamanagement.com/accounts/current-user/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${tokenData.token}`,
          },
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Failed to fetch user details');
      }

      const userData: UserData = await userResponse.json();

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        firstName: userData.first_name,
        authProvider: userData.auth_provider,
        isActive: userData.is_active,
        isStaff: userData.is_staff,
        dateJoined: userData.date_joined,
        profile: userData.profile,
        subscription: userData.subscription,
        referral_code: userData.referral_code,
        referrer: userData.referrer,
        referred_users_count: userData.referred_users_count,
        total_referral_earnings: userData.total_referral_earnings,
        preference: userData.preference,
        groups: userData.groups,
      });
      setIsLogged(true);
      router.replace('/verify-email');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={[styles.safeArea, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Loading State */}
          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color="#FB902E" />
                <Text style={styles.loadingText}>Creating your account...</Text>
                <Text style={styles.loadingSubtext}>
                  This will just take a moment
                </Text>
              </View>
            </View>
          )}

          {/* Form Content */}
          {!isSubmitting && (
            <>
              {/* Header Section */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  Create Your Account
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.text.secondary }]}
                >
                  Join thousands of users finding their perfect property
                </Text>
              </View>

              {/* Form Fields Section */}
              <View style={styles.formSection}>
                <Text
                  style={[styles.sectionTitle, { color: colors.text.primary }]}
                >
                  Personal Information
                </Text>

                <View style={[styles.nameRow]}>
                  <View style={styles.nameField}>
                    <FormInput
                      placeholder="John"
                      value={form.first_name}
                      onChangeText={(text) =>
                        handleInputChange('first_name', text)
                      }
                    />
                  </View>
                  <View style={styles.nameField}>
                    <FormInput
                      placeholder="Last Name"
                      value={form.name}
                      onChangeText={(text) => handleInputChange('name', text)}
                    />
                  </View>
                </View>

                <FormInput
                  placeholder="john.doe@example.com"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                />

                <Text
                  style={[styles.sectionTitle, { color: colors.text.primary }]}
                >
                  Security
                </Text>

                <PasswordInput
                  placeholder="Password"
                  value={form.password}
                  setForm={setForm}
                  form={form}
                  type="password"
                  validate={true}
                />
                <PasswordInput
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  setForm={setForm}
                  form={form}
                  type="confirmPassword"
                  validate={true}
                />

                {/* Terms Agreement */}
                <View style={styles.termsContainer}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        form.agreedToTerms && styles.checkboxChecked,
                      ]}
                      onPress={() =>
                        handleInputChange('agreedToTerms', !form.agreedToTerms)
                      }
                    >
                      {form.agreedToTerms && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.termsText,
                        { color: colors.text.secondary },
                      ]}
                    >
                      I agree to the{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={() =>
                          Linking.openURL(
                            'https://www.realvistaproperties.com/terms'
                          )
                        }
                      >
                        Terms of Use
                      </Text>{' '}
                      and{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={() =>
                          Linking.openURL(
                            'https://www.realvistaproperties.com/privacy-policy'
                          )
                        }
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                  {errors.agreedToTerms && (
                    <Text style={styles.errorText}>
                      Please agree to terms to continue
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    !form.agreedToTerms && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!form.agreedToTerms}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#FB902E', '#FFA726']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text
                    style={[
                      styles.dividerText,
                      { color: colors.text.secondary },
                    ]}
                  >
                    Or continue with
                  </Text>
                  <View style={styles.divider} />
                </View>

                {/* Social Login */}
                <View style={styles.socialContainer}>
                  {Platform.OS === 'android' ? (
                    <GoogleSignIn setUser={setUser} setIsLogged={setIsLogged} />
                  ) : (
                    <AppleLogin setUser={setUser} setIsLogged={setIsLogged} />
                  )}
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text
                    style={[styles.loginText, { color: colors.text.secondary }]}
                  >
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/sign-in')}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 214,
    height: 48,
    resizeMode: 'contain',
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
    lineHeight: 22,
  },
  formSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  nameField: {
    flex: 1,
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FB902E',
    borderColor: '#FB902E',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FB902E',
    fontWeight: '600',
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
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Abel-Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  socialContainer: {
    alignItems: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    color: '#FB902E',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 32,
  },
});

export default RegistrationForm;
