import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';

// User interface based on backend response
interface User {
    id: number;
    email: string;
    name: string;
    authProvider: string;
    isActive: boolean;
    isStaff: boolean;
    profile: any;
    groups: any[];
    preference: any;
    subscription: any;
    referral_code: string;
    referrer: string | null;
    referred_users_count: number;
    total_referral_earnings: number;
}

// Props interface
interface GoogleAuthSignInProps {
    setUser: (user: User) => void;
    setIsLogged: (logged: boolean) => void;
    router: typeof router;
}

export const googleAuthSignIn = async ({
    setUser,
    setIsLogged,
    router,
}: GoogleAuthSignInProps): Promise<void> => {
    try {
        await GoogleSignin.hasPlayServices();
        // const googleUserInfo = await GoogleSignin.signIn();

        // Dummy Google user info object
        const googleUserInfo = {
            user: {
                id: "1234567890",
                email: "orjigodswill@gmail.com",
                name: "Godswill Orji",
                familyName: "Orji",
                givenName: "Godswill",
            },
        };

        // Destructure like in your code
        const { email, id, name, familyName, givenName } = googleUserInfo.user;

        const fullName = name || givenName || '';
        const firstName = givenName || familyName || fullName.split(' ')[0];
        const lastName = familyName || fullName.split(' ')[1] || '';

        // Register or login with backend
        const response = await fetch(
            'https://www.realvistamanagement.com/accounts/register_google_user/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: lastName,
                    first_name: firstName,
                    email: email,
                    google_id: id,
                    auth_provider: 'google',
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to register with Google');
        }

        const result = await response.json();
        await AsyncStorage.setItem('authToken', result.token);

        // Fetch current user
        const userResponse = await fetch(
            'https://www.realvistamanagement.com/accounts/current-user/',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${result.token}`,
                },
            }
        );

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.error || 'Failed to fetch user details');
        }

        const userData = await userResponse.json();

        const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            authProvider: 'google',
            isActive: userData.is_active,
            isStaff: userData.is_staff,
            profile: userData.profile,
            groups: userData.groups,
            preference: userData.preference,
            subscription: userData.subscription,
            referral_code: userData.referral_code,
            referrer: userData.referrer,
            referred_users_count: userData.referred_users_count,
            total_referral_earnings: userData.total_referral_earnings,
        };

        setUser(mappedUser);
        setIsLogged(true);
        router.replace('/(app)/(tabs)');
    } catch (error: any) {
        Alert.alert('Google Sign-In Error', error.message || 'Something went wrong');
    }
};
