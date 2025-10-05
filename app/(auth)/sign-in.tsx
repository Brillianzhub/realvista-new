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
    Platform
} from 'react-native';
import images from '@/constants/images';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import FingerprintAuth from '@/components/auth/FingerprintAuth';
import * as WebBrowser from "expo-web-browser";
import { googleAuthSignIn } from '@/lib/googleAuthSignIn';
import { appleAuthSignIn } from '@/lib/appleAuthSignIn';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import AppleLogin from '@/components/auth/AppleLogin';
import Constants from 'expo-constants';

import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';

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


const { googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra || {};


// Sign-in function (moved outside component)
const signIn = async (email: string, password: string): Promise<SignInResult | null> => {
    try {
        const signInResponse = await fetch('https://www.realvistamanagement.com/accounts/signin/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        if (!signInResponse.ok) {
            const errorData = await signInResponse.json();
            throw new Error(errorData.error || 'Failed to sign in');
        }

        const tokenResponse = await fetch('https://www.realvistamanagement.com/portfolio/api-token-auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: email,
                password: password,
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

        return { token: tokenData.token, ...userData };
    } catch (error: any) {
        console.error('Sign-In Error:', error);
        Alert.alert('Sign-In Error', error.message);
        return null;
    }
};


const SignIn: React.FC = () => {
    const { setUser, isLogged, setIsLogged } = useGlobalContext() as GlobalContextType;
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
    });



    const fetchUserData = async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                console.log('Use password');
                return;
            }

            const response = await fetch('https://www.realvistamanagement.com/accounts/current-user/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
            });

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
            onFailure: () => {
                // Do nothing when fingerprint authentication fails or is canceled
            },
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
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {isSubmitting && (
                        <View style={{}}>
                            <ActivityIndicator size="large" color="#358B8B" />
                            <Text style={styles.loadingText}>Processing...</Text>
                        </View>
                    )}
                    {!isSubmitting && (
                        <>
                            <View style={styles.logoContainer}>
                                <Image source={images.logo} style={styles.logo} />
                            </View>

                            <FormInput
                                placeholder="Email"
                                keyboardType="email-address"
                                value={form.email}
                                onChangeText={(text: string) => handleInputChange('email', text)}
                            />
                            <PasswordInput
                                placeholder="Password"
                                value={form.password}
                                setForm={setForm}
                                form={form}
                                type="password"
                                validate={true}
                            />

                            <Link href="/forgot-password" style={{ color: '#358B8B', marginBottom: 20 }}>
                                Forgot your password ?
                            </Link>

                            <Pressable style={[styles.button]} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Login</Text>
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account with us ?</Text>
                                <Link href="/account-type" style={styles.link}>
                                    Sign Up
                                </Link>
                            </View>
                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ textAlign: 'center' }}>OR</Text>
                            </View>

                            {Platform.OS === 'android' ? (
                                <View style={{ marginVertical: 20 }}>
                                    <GoogleSignIn setUser={setUser} setIsLogged={setIsLogged} />
                                </View>
                            ) : (
                                <View style={{ marginVertical: 20 }}>
                                    <AppleLogin setUser={setUser} setIsLogged={setIsLogged} />
                                </View>
                            )}

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

export default SignIn;


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: isSmallScreen ? 15 : 20,
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
        fontSize: 20,
        color: '#fff',
        fontWeight: '400',
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    inputp: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
});