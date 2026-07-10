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
import { useGlobalContext } from '@/context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore } from '@/lib/tokenStore';
import api from '@/lib/apiClient';
import { hydrateUser } from '@/lib/userHydration';
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

// AsyncStorage keys
const STORAGE_KEYS = {
  REMEMBER_ME: 'rememberMe',
  SAVED_EMAIL: 'savedEmail',
  SAVED_PASSWORD: 'savedPassword',
};

interface FormData {
  email: string;
  password: string;
}

// Matches accounts._user_payload() — flat user fields + access/refresh (+ legacy `token`).
// When the account isn't email-verified yet, login_view returns a smaller shape
// with no tokens: { success: false, is_email_verified: false, id, message }.
interface SignInResult {
  id: number;
  email?: string;
  name?: string;
  first_name?: string;
  auth_provider?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_agent?: boolean;
  is_email_verified: boolean;
  date_joined?: string;
  profile?: any;
  referral_code?: string;
  preference?: any;
  access?: string;
  refresh?: string;
  message?: string;
}

const { googleWebClientId, googleIosClientId } =
  Constants.expoConfig?.extra || {};

// Sign-in function (moved outside component)
const signIn = async (
  email: string,
  password: string,
): Promise<SignInResult | null> => {
  try {
    // /api/auth/login/ returns a partial user payload (id, name, email, ...)
    // together with access/refresh in one response. The caller still follows
    // up with hydrateUser() (GET /api/users/me/) once tokens are stored, since
    // this response is missing several MeSerializer fields. If the account
    // isn't verified yet, it instead returns
    // { success: false, is_email_verified: false, id, message } with no tokens.
    const response = await api.post('/api/auth/login/', { email, password });
    const result: SignInResult = response.data;

    if (result.access) {
      await tokenStore.set(result.access);
      if (result.refresh) {
        await tokenStore.setRefresh(result.refresh);
      }
    }

    return result;
  } catch (error: any) {
    Alert.alert('Sign-In Error', error.response?.data?.error || error.message);
    return null;
  }
};

const SignIn: React.FC = () => {
  const { user, setUser, isLogged, setIsLogged } = useGlobalContext();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoadingSavedCredentials, setIsLoadingSavedCredentials] =
    useState(true);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const { colors } = useTheme();

  // Load saved credentials on component mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  // Save or clear credentials when rememberMe changes or after successful login
  useEffect(() => {
    if (!isLoadingSavedCredentials) {
      if (rememberMe && form.email && form.password) {
        saveCredentials(form.email, form.password);
      } else if (!rememberMe) {
        clearCredentials();
      }
    }
  }, [rememberMe, form.email, form.password]);

  const loadSavedCredentials = async () => {
    try {
      const [rememberMeValue, savedEmail, savedPassword] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD),
      ]);

      const isRememberMe = rememberMeValue === 'true';
      setRememberMe(isRememberMe);

      if (isRememberMe && savedEmail && savedPassword) {
        setForm({
          email: savedEmail,
          password: savedPassword,
        });
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    } finally {
      setIsLoadingSavedCredentials(false);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true'),
        AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email),
        AsyncStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, password),
      ]);
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const clearCredentials = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'false'),
        AsyncStorage.removeItem(STORAGE_KEYS.SAVED_EMAIL),
        AsyncStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD),
      ]);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  const updateSavedCredentialsAfterLogin = async (
    email: string,
    password: string,
  ) => {
    if (rememberMe) {
      await saveCredentials(email, password);
    }
  };

  useEffect(() => {
    if (!isLogged || !user) return;

    if (user.is_email_verified) {
      router.replace('/(app)/(tabs)');
    }
  }, [isLogged, user]);

  const handleSubmit = async (): Promise<void> => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(form.email, form.password);

      if (!result) return;

      // Save credentials after successful login if rememberMe is true
      await updateSavedCredentialsAfterLogin(form.email, form.password);

      if (!result.is_email_verified) {
        // No tokens are issued until verification completes, so there's no
        // authenticated session to hydrate yet — route straight to
        // verification using what the login response already gave us.
        const alreadyResent = await AsyncStorage.getItem('verificationResent');
        if (!alreadyResent) {
          api
            .post('/api/auth/resend-verification/', { email: result.email })
            .catch(() => {});
          await AsyncStorage.setItem('verificationResent', 'true');
        }

        router.replace({
          pathname: '/verify-email',
          params: { user_id: String(result.id), email: result.email ?? '' },
        });
        return;
      }

      // Tokens are already stored by signIn() — fetch the full, authoritative
      // user object instead of hand-mapping the login response.
      const hydratedUser = await hydrateUser();
      if (hydratedUser) {
        setUser(hydratedUser);
        setIsLogged(true);
      } else {
        Alert.alert('Error', 'Signed in, but failed to load your account. Please try again.');
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

  const handleRememberMeToggle = () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);

    // If unchecking remember me, clear saved credentials immediately
    if (!newValue) {
      clearCredentials();
    }
  };

  if (isLoadingSavedCredentials) {
    return (
      <View
        style={[
          styles.loadingOverlay,
          { backgroundColor: colors.background.primary },
        ]}
      >
        <ActivityIndicator size="large" color="#FB902E" />
      </View>
    );
  }

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
                validate={false}
              />

              {/* Remember Me & Forgot Password */}
              <View style={styles.utilityRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={handleRememberMeToggle}
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
                      'https://www.realvistaproperties.com/privacy-policy',
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
