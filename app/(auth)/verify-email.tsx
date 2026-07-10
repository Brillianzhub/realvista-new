import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Modal,
  Image,
  AppState,
  AppStateStatus,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import images from '../../constants/images';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/apiClient';
import { tokenStore } from '@/lib/tokenStore';
import { hydrateUser } from '@/lib/userHydration';

const { width } = Dimensions.get('window');

const VerifyEmail: React.FC = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const { colors } = useTheme();
  const [code, setCode] = useState<string[]>(['', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<number | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const param = useLocalSearchParams();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  const handleInputChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.replace(/[^0-9]/g, '').slice(0, 5);
      const newCode = ['', '', '', '', ''];
      pastedValue.split('').forEach((char, i) => {
        newCode[i] = char;
      });
      setCode(newCode);
      if (pastedValue.length === 5) {
        inputRefs.current[4]?.focus();
      } else {
        inputRefs.current[pastedValue.length]?.focus();
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = value.replace(/[^0-9]/g, '');
    setCode(newCode);

    if (value && index < 4) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 5) {
      triggerShake();
      Alert.alert(
        'Incomplete Code',
        'Please enter all 5 digits to verify your email.',
      );
      return;
    }

    setIsSubmitting(true);

    const userId =
      user?.id ??
      (typeof param.user_id === 'string' ? param.user_id : undefined);

    if (!userId) {
      Alert.alert('Error', 'Missing user information. Please try login again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post(`/api/auth/verify-email/${userId}/?code=${verificationCode}`);
      const result = response.data;

      // verify-email returns the full user payload + access/refresh
      // (accounts._user_payload) — this is where the session actually gets
      // created for email/password signups, since register never issues
      // tokens (the account isn't verified yet at that point).
      if (result.access) {
        await tokenStore.set(result.access);
        if (result.refresh) {
          await tokenStore.setRefresh(result.refresh);
        }
      }

      // Fetch the full, authoritative user object now that tokens are stored,
      // instead of hand-mapping this endpoint's response.
      const hydratedUser = await hydrateUser();
      if (hydratedUser) {
        setUser(hydratedUser);
        setIsLogged(true);
      }

      await AsyncStorage.multiRemove(['verificationResent', 'emailVerified']);

      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(true);
      });
    } catch (err: any) {
      if (err.response) {
        triggerShake();
        Alert.alert(
          'Verification Failed',
          err.response.data?.error || 'Invalid verification code.',
        );
      } else {
        Alert.alert(
          'Network Error',
          'Something went wrong. Please check your connection and try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isSubmitting) return;

    setIsSubmitting(true);

    const email =
      user?.email ??
      (typeof param.email === 'string' ? param.email : undefined);

    if (!email) {
      Alert.alert('Error', 'Missing email information. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/resend-verification/', { email });
      const data = response.data;

      if (data.success) {
        Alert.alert(
          'Code Resent',
          data.message ||
            'A new verification code has been sent to your email.',
        );
        setTimer(60);
        setCanResend(false);
      } else {
        Alert.alert(
          'Error',
          data.error || 'Failed to resend verification code.',
        );
      }
    } catch (err: any) {
      if (err.response) {
        Alert.alert(
          'Error',
          err.response.data?.error || 'Failed to resend verification code.',
        );
      } else {
        Alert.alert(
          'Network Error',
          'Unable to resend code. Please check your connection and try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleContinue = () => {
    setModalVisible(false);
    router.replace('/(app)/(tabs)');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={44} color="#358B8B" />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            Verify Your Email
          </Text>

          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            We've sent a 5-digit code to
          </Text>

          <Text style={[styles.emailText, { color: colors.text.primary }]}>
            {user?.email || 'your email address'}
          </Text>

          <Text style={[styles.instruction, { color: colors.text.secondary }]}>
            Enter the code below to verify your email address
          </Text>
        </View>

        {/* Code Input Section */}
        <Animated.View
          style={[
            styles.codeContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <View style={styles.inputsRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit ? styles.filledInput : styles.emptyInput,
                  isFocused === index && styles.focusedInput,
                ]}
                value={digit}
                onChangeText={(value) => handleInputChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                onFocus={() => setIsFocused(index)}
                onBlur={() => setIsFocused(null)}
                selectTextOnFocus
                editable={!isSubmitting}
              />
            ))}
          </View>

          {code.filter((d) => d !== '').length > 0 && (
            <Text style={styles.codeProgress}>
              {code.filter((d) => d !== '').length}/5 digits entered
            </Text>
          )}
        </Animated.View>

        {/* Timer Section */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCard}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={[styles.timerText, { color: colors.text.secondary }]}>
              {canResend
                ? 'Ready to resend'
                : `Resend code in ${formatTime(timer)}`}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={!isCodeComplete || isSubmitting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                isCodeComplete ? ['#efa968', '#358B8B'] : ['#9CA3AF', '#D1D5DB']
              }
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.verifyButtonText}>Verify Email</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendButton,
              (!canResend || isSubmitting) && styles.resendDisabled,
            ]}
            onPress={handleResendCode}
            disabled={!canResend || isSubmitting}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={canResend ? '#FB902E' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.resendButtonText,
                canResend ? styles.resendEnabled : styles.resendDisabledText,
              ]}
            >
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#358B8B"
          />
          <View style={styles.helpContent}>
            <Text style={[styles.helpTitle, { color: colors.text.primary }]}>
              Didn't receive the code?
            </Text>
            <Text style={[styles.helpText, { color: colors.text.secondary }]}>
              • Check your spam folder{'\n'}• Ensure you entered the correct
              email{'\n'}• Wait for the timer to expire to resend
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: successAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#358B8B" />
            </View>

            <Text style={styles.modalTitle}>Email Verified!</Text>

            <Text style={styles.modalMessage}>
              Your email has been successfully verified. You can now access all
              features.
            </Text>

            <Image
              source={images.welcome}
              style={styles.modalImage}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#efa968', '#358B8B']}
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="arrow-forward" size={20} color="white" />
                <Text style={styles.continueButtonText}>Continue to App</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
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
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  codeInput: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  emptyInput: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  filledInput: {
    borderColor: '#358B8B',
    backgroundColor: 'white',
  },
  focusedInput: {
    borderColor: '#358B8B',
    backgroundColor: 'white',
    shadowColor: '#358B8B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeProgress: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    gap: 16,
    marginBottom: 32,
  },
  verifyButton: {
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
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  resendDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendEnabled: {
    color: '#FB902E',
  },
  resendDisabledText: {
    color: '#9CA3AF',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalImage: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyEmail;
