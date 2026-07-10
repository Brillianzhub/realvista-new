import React, { useEffect, useState } from "react";
import { Alert,  ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import api from "@/lib/apiClient";
import { tokenStore } from "@/lib/tokenStore";
// NOTE: lib/googleAuthSignIn.tsx is an unused, dead alternate implementation
// of this same flow (confirmed via project-wide grep — nothing imports it).
// This component is the one actually wired into sign-in/sign-up screens.
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import Constants from 'expo-constants';
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from '@/context/ThemeContext';
import { hydrateUser, type HydratedUser } from "@/lib/userHydration";

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInProps {
    setUser: (user: HydratedUser) => void;
    setIsLogged: (logged: boolean) => void;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ setUser, setIsLogged }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loading, setLoading] = useState(false);
    const { googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra || {};

    const { colors } = useTheme();

    // Configure Google sign-in request
    const [request, response, promptAsync] = Google.useAuthRequest({
        // clientId: "YOUR_EXPO_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        iosClientId: googleIosClientId,
        androidClientId: "249644969622-ri71m1pf3hu11l625cldm1lq9b7p6lsn.apps.googleusercontent.com",
        webClientId: googleWebClientId,
    });


    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === "success" && response.authentication?.accessToken) {
                try {
                    setIsSubmitting(true);

                    // Unlike the legacy endpoint, /api/auth/google/ does NOT
                    // resolve the Google access token into a profile itself —
                    // it expects google_id/email/name/first_name already
                    // resolved client-side. Fetch Google's userinfo endpoint
                    // with the access token to get them.
                    const profileResponse = await fetch(
                        "https://www.googleapis.com/userinfo/v2/me",
                        {
                            headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
                        }
                    );
                    if (!profileResponse.ok) {
                        throw new Error("Failed to fetch Google profile.");
                    }
                    const googleProfile = await profileResponse.json();

                    // /api/auth/google/ returns a partial user payload +
                    // access/refresh directly (accounts._user_payload).
                    // hydrateUser() (GET /api/users/me/) below fills in the rest.
                    const responseApi = await api.post(
                        "/api/auth/google/",
                        {
                            google_id: googleProfile.id,
                            email: googleProfile.email,
                            name: googleProfile.name,
                            first_name: googleProfile.given_name,
                        }
                    );

                    const userData = responseApi.data;
                    await tokenStore.set(userData.access);
                    if (userData.refresh) {
                        await tokenStore.setRefresh(userData.refresh);
                    }

                    // Fetch the full, authoritative user object instead of
                    // hand-mapping this endpoint's (partial) response.
                    const hydratedUser = await hydrateUser();
                    if (!hydratedUser) {
                        Alert.alert("Google Sign-In Error", "Signed in, but failed to load your account. Please try again.");
                        return;
                    }

                    setUser(hydratedUser);
                    setIsLogged(true);
                    router.replace("/(app)/(tabs)");
                } catch (error: any) {
                    Alert.alert("Google Sign-In Error", error.response?.data?.error || error.message);
                } finally {
                    setIsSubmitting(false);
                }
            }
        };

        handleResponse();
    }, [response]);

    return (
        <View style={styles.container}>
            {isSubmitting ? (
                <ActivityIndicator size="large" color={colors.icon.default} />
            ) : (
                <TouchableOpacity style={styles.appleButton} onPress={() => promptAsync()}>
                    <FontAwesome name="google" size={20} color={colors.icon.default} style={{ marginRight: 10 }} />
                    <Text style={[styles.appleText, {color: colors.text.primary}]}>Sign in with Google</Text>
                </TouchableOpacity>
            )}
        </View>
    );

};

export default GoogleSignIn;

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        alignItems: "center",
        width: "100%",
    },
    appleButton: {
        width: "100%",
        height: 50,
        backgroundColor: "transparent",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    appleText: {
        fontSize: 16,
        fontWeight: "600",
    },
});