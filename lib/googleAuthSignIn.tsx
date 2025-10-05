import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";

// required for Expo AuthSession to complete redirects
WebBrowser.maybeCompleteAuthSession();

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

/**
 * Google Authentication with Expo AuthSession
 */
export const googleAuthSignIn = async ({
    setUser,
    setIsLogged,
    router,
}: GoogleAuthSignInProps): Promise<void> => {
    try {
        // Request object for Google Sign-In
        const [request, response, promptAsync] = Google.useAuthRequest({
            clientId: "YOUR_EXPO_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            iosClientId: "YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            androidClientId: "YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            webClientId: "YOUR_WEB_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        });

        // Trigger Google login popup
        const result = await promptAsync();

        if (result.type !== "success" || !result.authentication?.accessToken) {
            throw new Error("Google sign-in was cancelled or failed.");
        }

        // Send access token to backend
        const responseApi = await fetch(
            "https://www.realvistamanagement.com/accounts/register_google_user/",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: result.authentication.accessToken,
                    auth_provider: "google",
                }),
            }
        );

        if (!responseApi.ok) {
            throw new Error("Failed to register with Google");
        }

        const resultApi = await responseApi.json();
        await AsyncStorage.setItem("authToken", resultApi.token);

        // Fetch user details
        const userResponse = await fetch(
            "https://www.realvistamanagement.com/accounts/current-user/",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${resultApi.token}`,
                },
            }
        );

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.error || "Failed to fetch user details");
        }

        const userData = await userResponse.json();

        const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            authProvider: "google",
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
        router.replace("/(app)/(tabs)");
    } catch (error: any) {
        Alert.alert(
            "Google Sign-In Error",
            error.message || "Something went wrong"
        );
    }
};
