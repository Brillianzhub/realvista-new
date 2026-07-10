import React, { useState } from "react";
import { Alert, ActivityIndicator, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import api from "@/lib/apiClient";
import { tokenStore } from "@/lib/tokenStore";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from '@/context/ThemeContext';
import { hydrateUser, type HydratedUser } from "@/lib/userHydration";

interface AppleTokenPayload {
    sub: string;
    email?: string;
    email_verified?: boolean;
}

interface AppleLoginProps {
    setUser: (user: HydratedUser) => void;
    setIsLogged: (logged: boolean) => void;
}

const AppleLogin: React.FC<AppleLoginProps> = ({ setUser, setIsLogged }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { colors } = useTheme();

    const handleAppleLogin = async () => {
        try {
            setLoading(true);

            // Step 1: Ask Apple for credential
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                throw new Error("No identity token from Apple");
            }

            // Step 2: Decode Apple token
            const decoded: AppleTokenPayload = jwtDecode(credential.identityToken);

            const payload = {
                apple_user: decoded.sub,
                email: decoded.email ?? null,
                first_name: credential.fullName?.givenName || "",
                // Backend reads `name`, not `last_name` — see accounts.views_users_auth.apple_sign_in
                name: credential.fullName?.familyName || "",
                identity_token: credential.identityToken,
            };

            // Step 3: Send to backend — /api/auth/apple/ returns a partial
            // user payload + access/refresh directly (accounts._user_payload).
            // hydrateUser() (GET /api/users/me/) below fills in the rest.
            const response = await api.post(
                "/api/auth/apple/",
                payload
            );

            const userData = response.data;

            // Step 4: Store tokens
            await tokenStore.set(userData.access);
            if (userData.refresh) {
                await tokenStore.setRefresh(userData.refresh);
            }

            // Step 5: Fetch the full, authoritative user object instead of
            // hand-mapping this endpoint's (partial) response.
            const hydratedUser = await hydrateUser();
            if (!hydratedUser) {
                Alert.alert("Apple Login Error", "Signed in, but failed to load your account. Please try again.");
                return;
            }

            setUser(hydratedUser);
            setIsLogged(true);

            // Step 6: Navigate
            router.replace("/(app)/(tabs)");
        } catch (error: any) {
            if (error.code === "ERR_CANCELED") return;
            console.error("Apple login failed", error);
            Alert.alert("Apple Login Error", error.response?.data?.error || error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.icon.default} />
            ) : (
                <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
                    <FontAwesome name="apple" size={20} color={colors.icon.default} style={{ marginRight: 10 }} />
                    <Text style={[styles.appleText, {color: colors.text.primary}]}>Continue with Apple</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default AppleLogin;

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
