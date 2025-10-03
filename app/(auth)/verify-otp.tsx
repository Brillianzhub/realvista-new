import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    Alert,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

type VerifyOtpParams = {
    email?: string;
};

const VerifyOtp: React.FC = () => {
    const { email } = useLocalSearchParams<VerifyOtpParams>();
    const [otp, setOtp] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(120); 
    const [canResend, setCanResend] = useState<boolean>(false);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert("Error", "Please enter the OTP.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                "https://www.realvistamanagement.com/accounts/verify-otp/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "OTP verification failed.");
            }

            router.replace({ pathname: "/reset-password", params: { email } });
        } catch (err: unknown) {
            const error = err as Error;
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        setCanResend(false);
        setTimer(120);

        try {
            const response = await fetch(
                "https://www.realvistamanagement.com/accounts/request-password-reset/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to resend OTP.");
            }
        } catch (err: unknown) {
            const error = err as Error;
            Alert.alert("Error", error.message);
            setCanResend(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.instruction}>
                Enter the One-Time Password (OTP) sent to your email address for
                security verification before proceeding with password changes.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
            />

            <View style={styles.resendContainer}>
                <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
                    <Text
                        style={[
                            styles.resendText,
                            !canResend && styles.resendDisabled,
                        ]}
                    >
                        {canResend ? "Resend Code" : "Wait to resend"}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.timer}>
                    {canResend
                        ? ""
                        : `Resend in ${Math.floor(timer / 60)}:${String(
                            timer % 60
                        ).padStart(2, "0")}`}
                </Text>
            </View>

            <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isSubmitting}
            >
                <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
        </View>
    );
};

export default VerifyOtp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    instruction: {
        fontSize: 14,
        textAlign: "center",
        color: "#555",
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
        marginBottom: 20,
    },
    resendContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    resendText: {
        fontSize: 16,
        color: "#FB902E",
        fontWeight: "bold",
    },
    resendDisabled: {
        color: "#aaa",
    },
    timer: {
        fontSize: 16,
        color: "#555",
    },
    button: {
        height: 50,
        backgroundColor: "#FB902E",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30,
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
