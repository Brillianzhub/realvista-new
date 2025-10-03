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
    Dimensions
} from 'react-native';
import images from '@/constants/images';
import { useGlobalContext } from '../../context/GlobalProvider';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { googleAuthSignIn } from '@/lib/googleAuthSignIn';
import Constants from 'expo-constants';

import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 700;


// Type definitions
interface FormData {
    name: string;
    first_name: string;
    email: string;
    password: string;
    confirmPassword: string;
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

const { googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra || {};

const RegistrationForm = () => {
    const { setUser, setIsLogged } = useGlobalContext() as GlobalContextType;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        first_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: ''
    });


    const configureGoogleSignIn = async () => {
        GoogleSignin.configure({
            webClientId: googleWebClientId,
            iosClientId: googleIosClientId,
            offlineAccess: true,
        });
    };

    useEffect(() => {
        configureGoogleSignIn();
    }, []);

    const handleGoogleAuth = async () => {
        setIsSubmitting(true);
        try {
            await googleAuthSignIn({ setUser, setIsLogged, router });
        } catch (error) {
            console.error('Google Auth Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateForm = (form: FormData): ValidationResult => {
        const { email, password, confirmPassword } = form;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/;

        if (!email.trim()) {
            return { valid: false, message: "Email is required." };
        }

        if (!emailRegex.test(email)) {
            return { valid: false, message: "Please enter a valid email address." };
        }

        if (!password.trim()) {
            return { valid: false, message: "Password is required." };
        }

        if (!strongPasswordRegex.test(password)) {
            return {
                valid: false,
                message:
                    "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
            };
        }

        if (!confirmPassword.trim()) {
            return { valid: false, message: "Confirm password is required." };
        }

        if (password !== confirmPassword) {
            return { valid: false, message: "Passwords do not match." };
        }

        return { valid: true };
    };

    const handleInputChange = (field: keyof FormData, value: string): void => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (): Promise<void> => {
        const validation = validateForm(form);

        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('https://www.realvistamanagement.com/accounts/register_user/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name,
                    first_name: form.first_name,
                    email: form.email,
                    password: form.password,
                    auth_provider: 'email'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to sign up');
            }

            const result = await response.json();

            const tokenResponse = await fetch('https://www.realvistamanagement.com/portfolio/api-token-auth/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.email,
                    password: form.password,
                }),
            });

            const tokenData: TokenData = await tokenResponse.json();

            if (!tokenData.token) {
                throw new Error('Authentication token not provided');
            }

            await AsyncStorage.setItem('authToken', tokenData.token);

            const userResponse = await fetch('https://www.realvistamanagement.com/accounts/current-user/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${tokenData.token}`,
                },
            });

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
        <View style={styles.safeArea}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {isSubmitting && (
                        <View style={{}}>
                            <ActivityIndicator size="large" color="#358B8B" />
                            <Text style={styles.loadingText}>Registering...</Text>
                        </View>
                    )}
                    {!isSubmitting && (
                        <>
                            <View style={styles.logoContainer}>
                                <Image source={images.logo} style={styles.logo} />
                            </View>
                            <FormInput
                                placeholder="Last Name"
                                value={form.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                            />
                            <FormInput
                                placeholder="First Name"
                                value={form.first_name}
                                onChangeText={(text) => handleInputChange('first_name', text)}
                            />
                            <FormInput
                                placeholder="Email"
                                keyboardType="email-address"
                                value={form.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                            />
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

                            <Pressable style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Register</Text>
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Have an account already?</Text>
                                <Link href="/sign-in" style={styles.link}>
                                    Sign In
                                </Link>
                            </View>
                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ textAlign: 'center' }}>OR</Text>
                            </View>
                            <View style={{ marginVertical: 20 }}>
                                <Pressable style={[styles.googleBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }]} onPress={handleGoogleAuth}>
                                    <Image
                                        source={images.google}
                                        style={styles.googleBtnImage}
                                    />
                                    <Text style={[styles.buttonText, { color: '#000', textAlign: 'center' }]}>Login with Google</Text>
                                </Pressable>
                            </View>
                            <View style={{ marginVertical: 10 }}>
                                <Text style={styles.text}>
                                    By continuing, you agree to our{' '}
                                    <Text
                                        style={styles.link2}
                                        onPress={() =>
                                            Linking.openURL('https://www.realvistaproperties.com/terms')
                                        }
                                    >
                                        Terms of Use
                                    </Text>{' '}
                                    and{' '}
                                    <Text
                                        style={styles.link2}
                                        onPress={() =>
                                            Linking.openURL('https://www.realvistaproperties.com/privacy-policy')
                                        }
                                    >
                                        Privacy Policy
                                    </Text>
                                    .
                                </Text>
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
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: isSmallScreen ? 15 : 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'left',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    inputKeyboardVisible: {
        backgroundColor: '#eef',
    },
    button: {
        height: 50,
        backgroundColor: '#FB902E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        marginTop: 10,
    },
    buttonText: {
        fontFamily: 'Abel-Regular',
        color: '#fff',
        fontSize: 18,
        fontWeight: '400',
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 214,
        height: 48,
        resizeMode: 'contain',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'gray',
    },
    link: {
        color: '#358B8B',
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 16,
    },
    googleBtn: {
        borderWidth: 3,
        borderColor: '#FB902E',
        borderRadius: 30,
        padding: 8
    },
    googleBtnImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    text: {
        fontSize: 15,
        color: '#000',
        textAlign: 'center',
    },
    link2: {
        color: '#358B8B',
        textDecorationLine: 'underline',
    },
    loadingContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#000',
        textAlign: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
    },
});

export default RegistrationForm;
