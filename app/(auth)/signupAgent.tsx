import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/apiClient';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';

import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useReferralPromotion } from '@/hooks/promotions/useReferralPromotion';
import { getDeviceId } from '@/utils/device/deviceUtils';

// Type definitions
interface FormData {
  agreedToTerms: boolean;
  name: string;
  first_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agency_name: string;
  agency_address: string;
  bios: string;
  phone_number: string;
  whatsapp_number: string;
  experience_years: string;
  preferred_contact_mode: string;
  referrer_code: string;
  promotion_code: string;
  install_id: string;
  device_id: string;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

// POST /api/auth/register/ only returns { id, name, email } — no tokens.
// The account isn't email-verified yet, so no session can be issued
// until verify-email.tsx completes the OTP step.
interface RegisterResult {
  id: number;
  name: string;
  email: string;
}

interface GlobalContextType {
  setUser: (user: any) => void;
  setIsLogged: (isLogged: boolean) => void;
}

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 700;

const AgentRegistrationForm: React.FC = () => {
  const { setUser, setIsLogged } = useGlobalContext() as GlobalContextType;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { promotion, loading } = useReferralPromotion();

  const { colors } = useTheme();

  const [form, setForm] = useState<FormData>({
    agreedToTerms: false,
    name: '',
    first_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agency_name: '',
    agency_address: '',
    bios: '',
    phone_number: '',
    whatsapp_number: '',
    experience_years: '',
    preferred_contact_mode: '',
    referrer_code: '',
    promotion_code: '',
    install_id: '',
    device_id: '',
  });

  useEffect(() => {
    const initIds = async () => {
      try {
        const rawInstallId = await AsyncStorage.getItem('install_id');
        const deviceId = await getDeviceId();

        setForm((prev) => ({
          ...prev,
          install_id: rawInstallId || '',
          device_id: deviceId || '',
        }));
      } catch (error) {
        console.error('Error loading IDs:', error);
      }
    };

    initIds();
  }, []);

  const validateForm = (form: FormData): ValidationResult => {
    const { email, password, confirmPassword } = form;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

    return { valid: true };
  };

  const handleSubmit = async (): Promise<void> => {
    const validation = validateForm(form);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/register/', {
        name: form.name,
        first_name: form.first_name,
        email: form.email,
        password: form.password,
        auth_provider: 'email',
        is_agent: true,

        bios: form.bios,
        agency_name: form.agency_name,
        agency_address: form.agency_address,
        phone_number: form.phone_number,
        whatsapp_number: form.whatsapp_number,
        experience_years: form.experience_years,
        preferred_contact_mode: form.preferred_contact_mode,

        referrer_code: form.referrer_code,
        promotion_code: promotion ? promotion.code : '',
        install_id: form.install_id,
        device_id: form.device_id,
      });

      const result: RegisterResult = response.data;

      // No tokens are issued at registration — the account isn't verified
      // yet. Hand off to verify-email.tsx with the id/email it needs;
      // tokenStore.set/setUser/setIsLogged happen there once the OTP
      // step succeeds and the backend actually issues a session.
      router.replace({
        pathname: '/verify-email',
        params: { user_id: String(result.id), email: result.email },
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
                <ActivityIndicator size="large" color="#358B8B" />
                <Text style={styles.loadingText}>
                  Creating Professional Account...
                </Text>
                <Text style={styles.loadingSubtext}>
                  Setting up your agency profile
                </Text>
              </View>
            </View>
          )}

          {/* Form Content */}
          {!isSubmitting && (
            <>
              {/* Header Section */}
              <View style={styles.header}>
                <View style={styles.proBadge}>
                  <Ionicons name="shield-checkmark" size={20} color="#358B8B" />
                  <Text style={styles.proBadgeText}>Professional Account</Text>
                </View>
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  Agency Registration
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.text.secondary }]}
                >
                  Join our network of trusted real estate professionals
                </Text>
              </View>

              {/* Form Fields Section */}
              <View style={styles.formSection}>
                {/* Personal Information Section */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name="person-circle-outline"
                      size={22}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.cardTitle, { color: colors.text.primary }]}
                    >
                      Personal Information
                    </Text>
                  </View>

                  <View style={styles.nameRow}>
                    <View style={styles.nameField}>
                      <FormInput
                        placeholder="First Name"
                        value={form.first_name}
                        onChangeText={(text: string) =>
                          handleInputChange('first_name', text)
                        }
                      />
                    </View>
                    <View style={styles.nameField}>
                      <FormInput
                        placeholder="Last Name"
                        value={form.name}
                        onChangeText={(text: string) =>
                          handleInputChange('name', text)
                        }
                      />
                    </View>
                  </View>

                  <FormInput
                    placeholder="Email"
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(text: string) =>
                      handleInputChange('email', text)
                    }
                  />

                  <FormInput
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={form.phone_number}
                    onChangeText={(text: string) =>
                      handleInputChange('phone_number', text)
                    }
                  />

                  <FormInput
                    placeholder="WhatsApp Number"
                    keyboardType="phone-pad"
                    value={form.whatsapp_number}
                    onChangeText={(text: string) =>
                      handleInputChange('whatsapp_number', text)
                    }
                  />
                </View>

                {/* Agency Information Section */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name="business-outline"
                      size={22}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.cardTitle, { color: colors.text.primary }]}
                    >
                      Agency Information
                    </Text>
                  </View>

                  <FormInput
                    placeholder="Agency Name"
                    value={form.agency_name}
                    onChangeText={(text: string) =>
                      handleInputChange('agency_name', text)
                    }
                  />

                  <FormInput
                    placeholder="Agency Address"
                    value={form.agency_address}
                    onChangeText={(text: string) =>
                      handleInputChange('agency_address', text)
                    }
                  />

                  <FormInput
                    placeholder="Years of Experience"
                    keyboardType="numeric"
                    value={form.experience_years}
                    onChangeText={(text: string) =>
                      handleInputChange('experience_years', text)
                    }
                  />
                </View>

                {/* Professional Details Section */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.cardTitle, { color: colors.text.primary }]}
                    >
                      Professional Details
                    </Text>
                  </View>

                  <FormInput
                    placeholder="Professional Bio"
                    multiline
                    numberOfLines={4}
                    value={form.bios}
                    onChangeText={(text: string) =>
                      handleInputChange('bios', text)
                    }
                    style={[
                      styles.bioInput,
                      {
                        color: colors.text.primary,
                        borderColor: colors.border.default,
                      },
                    ]}
                  />

                  <View style={styles.pickerContainer}>
                    <Text
                      style={[
                        styles.pickerLabel,
                        { color: colors.text.primary },
                      ]}
                    >
                      Preferred Contact Mode
                    </Text>
                    <View style={styles.pickerWrapper}>
                      <RNPickerSelect
                        onValueChange={(value: string) =>
                          setForm((prev) => ({
                            ...prev,
                            preferred_contact_mode: value,
                          }))
                        }
                        placeholder={{
                          label: 'Select preferred contact method...',
                          value: '',
                          color: '#9CA3AF',
                        }}
                        style={pickerSelectStyles}
                        value={form.preferred_contact_mode}
                        items={[
                          { label: '📞 Phone Call', value: 'phone' },
                          { label: '💬 WhatsApp', value: 'whatsapp' },
                          { label: '📧 Email', value: 'email' },
                        ]}
                        Icon={() => (
                          <View style={styles.pickerIcon}>
                            <Ionicons
                              name="chevron-down"
                              size={20}
                              color="#6B7280"
                            />
                          </View>
                        )}
                      />
                    </View>
                    <Text style={styles.pickerHelper}>
                      How clients should contact you
                    </Text>
                  </View>
                </View>

                {/* Security Section */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.cardTitle, { color: colors.text.primary }]}
                    >
                      Account Security
                    </Text>
                  </View>

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
                </View>

                {/* Agency Information Section */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name="share-social-outline"
                      size={22}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.cardTitle, { color: colors.text.primary }]}
                    >
                      Referral Code (Optional)
                    </Text>
                  </View>

                  <FormInput
                    placeholder="a276e48ecdef"
                    value={form.referrer_code}
                    onChangeText={(text: string) =>
                      handleInputChange('referrer_code', text)
                    }
                  />
                </View>

                {/* Terms Agreement */}
                <View
                  style={[
                    styles.termsCard,
                    {
                      borderColor: colors.border.default,
                      backgroundColor: colors.background.secondary,
                    },
                  ]}
                >
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        { borderColor: colors.border.default },
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
                            'https://www.realvistaproperties.com/terms-of-use',
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
                            'https://www.realvistaproperties.com/privacy-policy',
                          )
                        }
                      >
                        Privacy Policy
                      </Text>{' '}
                      for professional accounts
                    </Text>
                  </View>
                  {!form.agreedToTerms && (
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
                  disabled={!form.agreedToTerms || isSubmitting}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#efa968', '#358B8B']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="shield-checkmark" size={20} color="white" />
                    <Text style={styles.buttonText}>
                      Create Professional Account
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

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

                {/* Verification Notice */}
                <View
                  style={[
                    styles.noticeCard,
                    { backgroundColor: colors.background.secondary },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color="#358B8B"
                  />
                  <Text
                    style={[styles.noticeText, { color: colors.text.muted }]}
                  >
                    Professional accounts require verification. You'll receive
                    an email with next steps within 24-48 hours.
                  </Text>
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
    marginTop: 0,
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
    marginBottom: 16,
  },
  logo: {
    width: 214,
    height: 48,
    resizeMode: 'contain',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  proBadgeText: {
    color: '#358B8B',
    fontSize: 14,
    fontWeight: '600',
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
    maxWidth: 300,
  },
  formSection: {
    width: '100%',
    gap: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  nameField: {
    flex: 1,
  },
  bioInput: {
    minHeight: 120,
    borderWidth: 1,
    textAlignVertical: 'top',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    marginTop: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  pickerIcon: {
    position: 'absolute',
    right: 4,
    top: '50%',
    marginTop: 15,
  },
  pickerHelper: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    marginLeft: 4,
  },
  termsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#358B8B',
    borderColor: '#358B8B',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#358B8B',
    fontWeight: '600',
  },
  button: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#358B8B',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    color: '#358B8B',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 32,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 0,
    color: '#111827',
    backgroundColor: 'transparent',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 0,
    color: '#111827',
    backgroundColor: 'transparent',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  iconContainer: {
    right: 16,
  },
};

export default AgentRegistrationForm;
