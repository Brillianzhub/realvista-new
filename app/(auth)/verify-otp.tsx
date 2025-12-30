import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FormInput from '@/components/auth/FormInput';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

type VerifyOtpParams = {
  email?: string;
};

const VerifyOtp: React.FC = () => {
  const { email } = useLocalSearchParams<VerifyOtpParams>();
  const [otp, setOtp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(120);
  const [canResend, setCanResend] = useState<boolean>(false);
  const { colors } = useTheme();

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(1)).current;
  const inputRefs = useRef<Array<any>>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: timer / 120,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.replace(/[^0-9]/g, '').slice(0, 6);
      setOtp(pastedText);
      // Focus last input
      if (pastedText.length === 5) {
        inputRefs.current[4]?.focus();
      } else {
        inputRefs.current[pastedText.length]?.focus();
      }
      return;
    }

    const newCode = otp.split('');
    newCode[index] = text.replace(/[^0-9]/g, '');
    const newOtp = newCode.join('');
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus();
      const newCode = otp.split('');
      newCode[index - 1] = '';
      setOtp(newCode.join(''));
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 5) {
      triggerShake();
      Alert.alert('Invalid OTP', 'Please enter a valid 5-digit OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://www.realvistamanagement.com/accounts/verify-otp/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        triggerShake();
        throw new Error(data.error || 'OTP verification failed.');
      }

      router.replace({ pathname: '/reset-password', params: { email } });
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Verification Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(120);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }

      Alert.alert(
        'Code Resent',
        'A new verification code has been sent to your email.'
      );
    } catch (err: unknown) {
      const error = err as Error;
      Alert.alert('Error', error.message);
      setCanResend(true);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
              <Ionicons
                name="shield-checkmark-outline"
                size={44}
                color="#358B8B"
              />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            Enter Verification Code
          </Text>

          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            We've sent a 5-digit code to:
          </Text>

          <Text style={[styles.emailText, { color: colors.text.primary }]}>
            {email || 'your email address'}
          </Text>

          <Text style={[styles.instruction, { color: colors.text.secondary }]}>
            Enter the code below to verify your identity
          </Text>
        </View>

        {/* OTP Input Section */}
        <Animated.View
          style={[
            styles.otpContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <View style={styles.otpInputsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref && !inputRefs.current.includes(ref)) {
                    inputRefs.current[index] = ref;
                  }
                }}
                style={[
                  styles.otpBox,
                  otp[index] ? styles.filledBox : styles.emptyBox,
                  index === otp.length ? styles.activeBox : {},
                ]}
                keyboardType="number-pad"
                maxLength={index === 0 ? 5 : 1}
                value={otp[index] || ''}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
                editable={!isSubmitting}
              />
            ))}
          </View>

          {otp.length > 0 && otp.length < 5 && (
            <Text style={styles.codeLengthText}>
              {otp.length}/5 digits entered
            </Text>
          )}

          {/* Timer Progress Bar */}
          {!canResend && (
            <View style={styles.timerContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[styles.progressFill, { width: progressWidth }]}
                />
              </View>
              <Text style={styles.timerText}>
                Resend Code in {formatTime(timer)}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={[styles.resendPrompt, { color: colors.text.secondary }]}>
            Didn't receive the code?
          </Text>

          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={!canResend}
            style={styles.resendButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={canResend ? '#FB902E' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.resendText,
                canResend ? styles.resendEnabled : styles.resendDisabled,
              ]}
            >
              {canResend ? 'Resend Code' : 'Wait to Resend'}
            </Text>
          </TouchableOpacity>

          {canResend && (
            <Text style={styles.resendNote}>
              You can request a new code now
            </Text>
          )}
        </View>

        {/* Alternative: Single Input Field */}
        <View style={styles.alternativeContainer}>
          <Text
            style={[styles.alternativeLabel, { color: colors.text.secondary }]}
          >
            Or enter OTP in one field:
          </Text>
          <FormInput
            placeholder="Enter 5-digit OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={(text: string) =>
              setOtp(text.replace(/[^0-9]/g, '').slice(0, 5))
            }
            maxLength={5}
            editable={!isSubmitting}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (otp.length !== 5 || isSubmitting) && styles.buttonDisabled,
          ]}
          onPress={handleVerifyOtp}
          disabled={otp.length !== 5 || isSubmitting}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              otp.length === 5 ? ['#358B8B', '#34D399'] : ['#9CA3AF', '#D1D5DB']
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
                <Text style={styles.buttonText}>Verify & Continue</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Help Section */}
        <View
          style={[
            styles.helpCard,
            {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#3B82F6"
          />
          <View style={styles.helpContent}>
            <Text style={[styles.helpTitle, { color: colors.text.primary }]}>
              Need help?
            </Text>
            <Text style={[styles.helpText, { color: colors.text.secondary }]}>
              • Check your spam folder{'\n'}• Ensure you entered the correct
              email{'\n'}• Contact support if the issue persists
            </Text>
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
    alignItems: 'center',
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
    marginBottom: 40,
    width: '100%',
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
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  emptyBox: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  filledBox: {
    borderColor: '#358B8B',
    backgroundColor: 'white',
  },
  activeBox: {
    borderColor: '#3B82F6',
    backgroundColor: 'white',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeLengthText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FB902E',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendPrompt: {
    fontSize: 16,
    marginBottom: 12,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendEnabled: {
    color: '#FB902E',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  resendNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  alternativeContainer: {
    width: '100%',
    marginBottom: 24,
  },
  alternativeLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    width: '100%',
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
    marginBottom: 24,
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
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    width: '100%',
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
});

export default VerifyOtp;
