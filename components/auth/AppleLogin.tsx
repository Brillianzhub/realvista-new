import React, { useState } from "react";
import { Alert, ActivityIndicator, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

interface AppleTokenPayload {
    sub: string;
    email?: string;
    email_verified?: boolean;
}

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

interface AppleLoginProps {
    setUser: (user: User) => void;
    setIsLogged: (logged: boolean) => void;
}

const AppleLogin: React.FC<AppleLoginProps> = ({ setUser, setIsLogged }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
                last_name: credential.fullName?.familyName || "",
                identity_token: credential.identityToken,
            };

            // Step 3: Send to backend
            const response = await axios.post(
                "https://www.realvistamanagement.com/accounts/login/apple/",
                payload
            );

            const { token, user } = response.data;

            // Step 4: Store token + user
            await AsyncStorage.setItem("authToken", token);

            const userResponse = await fetch(
                "https://www.realvistamanagement.com/accounts/current-user/",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.error || "Failed to fetch user details");
            }

            const userData = await userResponse.json();

            // Step 5: Map user & update state
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

            // Step 6: Navigate
            router.replace("/(app)/(tabs)");
        } catch (error: any) {
            if (error.code === "ERR_CANCELED") return;
            console.error("Apple login failed", error);
            Alert.alert("Apple Login Error", error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#000" />
            ) : (
                <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
                    <FontAwesome name="apple" size={20} color="#000" style={{ marginRight: 10 }} />
                    <Text style={styles.appleText}>Continue with Apple</Text>
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
        color: "#000",
    },
});
