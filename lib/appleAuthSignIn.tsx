import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { jwtDecode } from 'jwt-decode';
import { router } from "expo-router";

// Define the shape of the decoded Apple identity token
interface AppleIdentityToken {
    email?: string;
    [key: string]: any; 
}

// Define your User shape based on backend response
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

// Props for the function
interface AppleAuthSignInProps {
    setUser: (user: User) => void;
    setIsLogged: (logged: boolean) => void;
    router: typeof router;
}

export const appleAuthSignIn = async ({
    setUser,
    setIsLogged,
    router,
}: AppleAuthSignInProps): Promise<void> => {
    if (Platform.OS !== "ios") {
        Alert.alert("Apple Sign-In is only available on iOS devices.");
        return;
    }

    try {
        const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        });

        if (!credential.identityToken) {
            throw new Error("No identity token from Apple");
        }

        const decoded = jwtDecode<AppleIdentityToken>(credential.identityToken);

        const appleId = credential.user;
        const email = credential.email || decoded.email || "";
        const firstName = credential.fullName?.givenName || "";
        const lastName = credential.fullName?.familyName || "";
        const displayName =
            `${firstName} ${lastName}`.trim() || email.split("@")[0];

        // Send to backend
        const response = await fetch(
            "https://www.realvistamanagement.com/accounts/register_apple_user/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    apple_id: appleId,
                    email: email,
                    first_name: firstName,
                    name: lastName || displayName,
                    auth_provider: "apple",
                    identity_token: credential.identityToken,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to register with Apple");
        }

        const result = await response.json();
        await AsyncStorage.setItem("authToken", result.token);

        // Fetch current user
        const userResponse = await fetch(
            "https://www.realvistamanagement.com/accounts/current-user/",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${result.token}`,
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
            authProvider: "apple",
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
        if (error.code === "ERR_CANCELED") {
            return;
        }
        Alert.alert("Apple Sign-In Error", error.message || "Something went wrong");
    }
};
