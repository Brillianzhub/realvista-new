import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';

interface User {
  id: number;
  email: string;
  name: string;
  firstName: string;
  authProvider: string;
  isActive: boolean;
  isStaff: boolean;
  dateJoined: string;
  profile: any;
  preference: any;
  groups: any[];
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const ResetPassword: React.FC = () => {
  const { email } = useLocalSearchParams<{ email: string; otp?: string }>();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState({
    password: false,
    confirm: false,
  });
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const { colors } = useTheme();
  const { setUser, setIsLogged } = useGlobalContext();
  const successAnimation = useRef(new Animated.Value(0)).current;
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    validatePasswordRequirements(password);
    validatePasswordsMatch();
  }, [password, confirmPassword]);

  const validatePasswordRequirements = (text: string) => {
    const newRequirements = {
      length: text.length >= 8,
      uppercase: /[A-Z]/.test(text),
      lowercase: /[a-z]/.test(text),
      number: /[0-9]/.test(text),
      special: /[!@#$%^&*(),.?":{}|<>_-]/.test(text),
    };

    setRequirements(newRequirements);

    const allValid = Object.values(newRequirements).every(
      (req) => req === true
    );
    setIsValid(
      allValid && text === confirmPassword && confirmPassword.length > 0
    );
  };

  const validatePasswordsMatch = () => {
    if (confirmPassword.length > 0) {
      setIsValid(
        Object.values(requirements).every((req) => req === true) &&
          password === confirmPassword
      );
    }
  };

  const triggerSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(500),
    ]).start();
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!isValid) {
      Alert.alert(
        'Invalid Password',
        'Please ensure your password meets all requirements and both fields match.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Reset password
      const response = await fetch(
        'https://www.realvistamanagement.com/accounts/password-reset/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      // Authenticate user to get token
      const tokenResponse = await fetch(
        'https://www.realvistamanagement.com/portfolio/api-token-auth/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        }
      );

      const tokenData: { token?: string; non_field_errors?: string[] } =
        await tokenResponse.json();

      if (!tokenData.token) {
        throw new Error(
          tokenData.non_field_errors?.[0] || 'Authentication token not provided'
        );
      }

      await AsyncStorage.setItem('authToken', tokenData.token);

      // Fetch current user
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
        const errorData: { error?: string } = await userResponse.json();
        throw new Error(errorData.error || 'Failed to fetch user details');
      }

      const userData = await userResponse.json();

      const mappedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        firstName: userData.first_name,
        authProvider: userData.auth_provider,
        isActive: userData.is_active,
        isStaff: userData.is_staff,
        dateJoined: userData.date_joined,
        profile: userData.profile,
        preference: userData.preference,
        groups: userData.groups,
      };

      setUser(mappedUser);
      setIsLogged(true);

      triggerSuccessAnimation();

      // Show success message
      Alert.alert(
        'Password Reset Successful!',
        'Your password has been reset, continue to login with your new password.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace('/sign-in');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.requirementItem}>
      <View style={[styles.requirementDot, met && styles.requirementMet]}>
        <Ionicons
          name={met ? 'checkmark' : 'close'}
          size={12}
          color={met ? 'white' : '#9CA3AF'}
        />
      </View>
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {label}
      </Text>
    </View>
  );

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    setIsFocused({ password: false, confirm: false });
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  {
                    transform: [
                      {
                        scale: successAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={44}
                  color="#358B8B"
                />
              </Animated.View>
            </View>

            <Text style={[styles.title, { color: colors.text.primary }]}>
              Create New Password
            </Text>

            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Choose a strong password to secure your account
            </Text>
          </View>

          {/* Password Fields Section */}
          <View style={styles.formSection}>
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
                  name="key-outline"
                  size={22}
                  color={colors.icon.active}
                />
                <Text
                  style={[styles.cardTitle, { color: colors.text.primary }]}
                >
                  Password Requirements
                </Text>
              </View>

              <View style={styles.requirementsGrid}>
                <RequirementItem
                  label="At least 8 characters"
                  met={requirements.length}
                />
                <RequirementItem
                  label="One uppercase letter"
                  met={requirements.uppercase}
                />
                <RequirementItem
                  label="One lowercase letter"
                  met={requirements.lowercase}
                />
                <RequirementItem label="One number" met={requirements.number} />
                <RequirementItem
                  label="One special character"
                  met={requirements.special}
                />
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text
                  style={[styles.inputLabel, { color: colors.text.primary }]}
                >
                  New Password
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocused.password && styles.inputWrapperFocused,
                    !isSubmitting && styles.inputWrapperDisabled,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isFocused.password ? '#3B82F6' : '#9CA3AF'}
                    style={styles.inputLeftIcon}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    style={[
                      styles.inputField,
                      isSubmitting && styles.inputFieldDisabled,
                    ]}
                    placeholder="Create a strong password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text: string) => {
                      setPassword(text);
                      validatePasswordRequirements(text);
                    }}
                    secureTextEntry={!showPassword}
                    onFocus={() =>
                      setIsFocused({ ...isFocused, password: true })
                    }
                    onBlur={() =>
                      setIsFocused({ ...isFocused, password: false })
                    }
                    editable={!isSubmitting}
                    selectionColor="#3B82F6"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() =>
                      confirmPasswordInputRef.current?.focus()
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={
                        isSubmitting
                          ? '#D1D5DB'
                          : isFocused.password
                          ? '#3B82F6'
                          : '#9CA3AF'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text
                  style={[styles.inputLabel, { color: colors.text.primary }]}
                >
                  Confirm Password
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocused.confirm && styles.inputWrapperFocused,
                    isSubmitting && styles.inputWrapperDisabled,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isFocused.confirm ? '#3B82F6' : '#9CA3AF'}
                    style={styles.inputLeftIcon}
                  />
                  <TextInput
                    ref={confirmPasswordInputRef}
                    style={[
                      styles.inputField,
                      isSubmitting && styles.inputFieldDisabled,
                    ]}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() =>
                      setIsFocused({ ...isFocused, confirm: true })
                    }
                    onBlur={() =>
                      setIsFocused({ ...isFocused, confirm: false })
                    }
                    editable={!isSubmitting}
                    selectionColor="#3B82F6"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color={
                        isSubmitting
                          ? '#D1D5DB'
                          : isFocused.confirm
                          ? '#3B82F6'
                          : '#9CA3AF'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Ionicons
                    name={
                      password === confirmPassword
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={18}
                    color={password === confirmPassword ? '#358B8B' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.matchText,
                      {
                        color:
                          password === confirmPassword ? '#358B8B' : '#EF4444',
                      },
                    ]}
                  >
                    {password === confirmPassword
                      ? 'Passwords match'
                      : "Passwords don't match"}
                  </Text>
                </View>
              )}
            </View>

            {/* Security Tips */}
            <View
              style={[
                styles.tipsCard,
                { backgroundColor: colors.background.secondary },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={colors.icon.active}
              />
              <View style={styles.tipsContent}>
                <Text
                  style={[styles.tipsTitle, { color: colors.text.primary }]}
                >
                  Security Tips
                </Text>
                <View style={styles.tipsList}>
                  <View style={styles.tipItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.tipText, { color: colors.text.secondary }]}
                    >
                      Use a unique password you haven't used elsewhere
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.tipText, { color: colors.text.secondary }]}
                    >
                      Consider using a password manager
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#358B8B"
                    />
                    <Text
                      style={[styles.tipText, { color: colors.text.secondary }]}
                    >
                      Change your password periodically
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!isValid || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!isValid || isSubmitting}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  isValid ? ['#efa968', '#358B8B'] : ['#9CA3AF', '#D1D5DB']
                }
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons
                      name="lock-open-outline"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonText}>Reset Password</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternative Option */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
              <Text style={styles.backText}>Back to verification</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#358B8B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
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
    flex: 1,
    gap: 24,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#3B82F6',
    backgroundColor: 'white',
  },
  inputWrapperDisabled: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  inputLeftIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    height: '100%',
  },
  inputFieldDisabled: {
    color: '#6B7280',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
  },
  requirementDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementMet: {
    backgroundColor: '#358B8B',
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  requirementTextMet: {
    color: '#358B8B',
    fontWeight: '500',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ResetPassword;
