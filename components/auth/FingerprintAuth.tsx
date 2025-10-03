import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

interface FingerprintAuthProps {
    onSuccess?: () => void;
    onFailure?: () => void;
}

interface FingerprintAuthReturn {
    authenticate: () => Promise<void>;
}

const FingerprintAuth = ({ onSuccess, onFailure }: FingerprintAuthProps): FingerprintAuthReturn => {
    const authenticate = async (): Promise<void> => {
        try {
            const isBiometricAvailable = await LocalAuthentication.isEnrolledAsync();
            if (!isBiometricAvailable) {
                Alert.alert('Error', 'No biometrics registered on this device.');
                onFailure && onFailure();
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate with Fingerprint',
                fallbackLabel: 'Use Passcode',
            });

            if (result.success) {
                onSuccess && onSuccess();
            } else {
                onFailure && onFailure();
            }
        } catch (error) {
            console.error('Authentication error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
            onFailure && onFailure();
        }
    };

    return { authenticate };
};

export default FingerprintAuth;
