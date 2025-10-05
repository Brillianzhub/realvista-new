import React, { useEffect, useState } from "react";
import { Alert, Button, ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import Constants from 'expo-constants';


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

interface GoogleSignInProps {
    setUser: (user: User) => void;
    setIsLogged: (logged: boolean) => void;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ setUser, setIsLogged }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);


    const { googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra || {};

    // Configure Google sign-in request
    const [request, response, promptAsync] = Google.useAuthRequest({
        // clientId: "YOUR_EXPO_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        iosClientId: googleIosClientId,
        // androidClientId: "YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        webClientId: googleWebClientId,
    });

    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === "success" && response.authentication?.accessToken) {
                try {
                    setIsSubmitting(true);

                    // Send token to backend
                    const responseApi = await fetch(
                        "https://www.realvistamanagement.com/accounts/register_google_user/",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                token: response.authentication.accessToken,
                                auth_provider: "google",
                            }),
                        }
                    );

                    if (!responseApi.ok) {
                        throw new Error("Failed to register with Google");
                    }

                    const resultApi = await responseApi.json();
                    await AsyncStorage.setItem("authToken", resultApi.token);

                    // Fetch current user
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
                    Alert.alert("Google Sign-In Error", error.message);
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        handleResponse();
    }, [response]);

    return (
        <View style={{ marginVertical: 20 }}>
            {isSubmitting ? (
                <ActivityIndicator size="large" color="#000" />
            ) : (
                <Button
                    title="Sign in with Google"
                    disabled={!request}
                    onPress={() => promptAsync()}
                />
            )}
        </View>
    );
};

export default GoogleSignIn;
