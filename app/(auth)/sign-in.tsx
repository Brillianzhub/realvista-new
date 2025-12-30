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
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import images from '@/constants/images';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import FingerprintAuth from '@/components/auth/FingerprintAuth';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import AppleLogin from '@/components/auth/AppleLogin';
import Constants from 'expo-constants';

import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';

import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 700;

interface FormData {
  // name: string;
  // first_name: string;
  email: string;
  password: string;
  // confirmPassword: string;
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

interface SignInResult {
  token: string;
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

interface TokenData {
  token: string;
}

interface GlobalContextType {
  setUser: (user: any) => void;
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;
}

const { googleWebClientId, googleIosClientId } =
  Constants.expoConfig?.extra || {};

// Sign-in function (moved outside component)
const signIn = async (
  email: string,
  password: string
): Promise<SignInResult | null> => {
  try {
    const signInResponse = await fetch(
      'https://www.realvistamanagement.com/accounts/signin/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }
    );

    if (!signInResponse.ok) {
      const errorData = await signInResponse.json();
      throw new Error(errorData.error || 'Failed to sign in');
    }

    const tokenResponse = await fetch(
      'https://www.realvistamanagement.com/portfolio/api-token-auth/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
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

    return { token: tokenData.token, ...userData };
  } catch (error: any) {
    console.error('Sign-In Error:', error);
    Alert.alert('Sign-In Error', error.message);
    return null;
  }
};

const SignIn: React.FC = () => {
  const { setUser, isLogged, setIsLogged } =
    useGlobalContext() as GlobalContextType;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const { colors } = useTheme();

  const fetchUserData = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.log('Use password');
        return;
      }

      const response = await fetch(
        'https://www.realvistamanagement.com/accounts/current-user/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      router.replace({
        pathname: '/(app)/(tabs)',
        params: { user: JSON.stringify(userData) },
      });
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  useEffect(() => {
    if (!isLogged) return;

    const { authenticate } = FingerprintAuth({
      onSuccess: fetchUserData,
      onFailure: () => {},
    });

    authenticate();
  }, [isLogged]);

  const handleSubmit = async (): Promise<void> => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(form.email, form.password);

      if (result) {
        setUser({
          id: result.id,
          email: result.email,
          name: result.name,
          firstName: result.first_name,
          authProvider: result.auth_provider,
          isActive: result.is_active,
          isStaff: result.is_staff,
          dateJoined: result.date_joined,
          profile: result.profile,
          preference: result.preference,
          subscription: result.subscription,
          referral_code: result.referral_code,
          referrer: result.referrer,
          referred_users_count: result.referred_users_count,
          total_referral_earnings: result.total_referral_earnings,
          groups: result.groups,
        });
        setIsLogged(true);
        router.replace('/(app)/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.safeArea, { backgroundColor: colors.background.primary }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Welcome Back
          </Text>

          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Sign in to continue to your account
          </Text>
        </View>

        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FB902E" />
              <Text style={styles.loadingText}>Signing you in...</Text>
            </View>
          </View>
        )}

        {!isSubmitting && (
          <View style={styles.formSection}>
            {/* Form Fields */}
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <FormInput
                placeholder="your.email@example.com"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text: string) =>
                  handleInputChange('email', text)
                }
                autoCapitalize="none"
                autoCorrect={false}
              />

              <PasswordInput
                placeholder="Enter your password"
                value={form.password}
                setForm={setForm}
                form={form}
                type="password"
                validate={true}
              />

              {/* Remember Me & Forgot Password */}
              <View style={styles.utilityRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.rememberText,
                      { color: colors.text.secondary },
                    ]}
                  >
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/forgot-password')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#FB902E', '#FFA726']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-in-outline" size={20} color="white" />
                <Text style={styles.signInButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text
                style={[styles.dividerText, { color: colors.text.secondary }]}
              >
                Or continue with
              </Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login */}
            <View style={styles.socialLoginContainer}>
              {Platform.OS === 'android' ? (
                <View style={styles.googleButton}>
                  <GoogleSignIn setUser={setUser} setIsLogged={setIsLogged} />
                </View>
              ) : (
                <View style={styles.appleButton}>
                  <AppleLogin setUser={setUser} setIsLogged={setIsLogged} />
                </View>
              )}
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text
                style={[styles.signUpText, { color: colors.text.secondary }]}
              >
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/account-type')}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Privacy */}
            <View style={styles.termsContainer}>
              <Text
                style={[styles.termsText, { color: colors.text.secondary }]}
              >
                By continuing, you agree to our{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Linking.openURL('https://www.realvistaproperties.com/terms')
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
                .
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 32,
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
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  formSection: {
    gap: 24,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FB902E',
  },
  signInButton: {
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
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Abel-Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  socialLoginContainer: {
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    maxWidth: 280,
  },
  appleButton: {
    width: '100%',
    maxWidth: 280,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  signUpText: {
    fontSize: 16,
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FB902E',
    textDecorationLine: 'underline',
  },
  termsContainer: {
    marginTop: 24,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FB902E',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
