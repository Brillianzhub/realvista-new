import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, Modal, Image, AppState, AppStateStatus } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import images from '../../constants/images';
import { ActivityIndicator } from 'react-native';

// Define user type (adjust fields as needed)
type User = {
    id: string | number;
    email: string;
};

const VerifyEmail: React.FC = () => {
    const { user } = useGlobalContext() as { user: User };
    const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
    const [timer, setTimer] = useState<number>(120);
    const [canResend, setCanResend] = useState<boolean>(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [appState, setAppState] = useState<AppStateStatus>(
        AppState.currentState
    );

    useEffect(() => {
        const subscription = AppState.addEventListener(
            "change",
            (nextAppState: AppStateStatus) => {
                if (appState === "background" && nextAppState === "active") {
                    console.log("App is back in foreground");
                }
                setAppState(nextAppState);
            }
        );

        return () => subscription.remove();
    }, [appState]);

    const handleInputChange = (value: string, index: number) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join("");
        if (verificationCode.length !== 5) {
            Alert.alert("Error", "Please enter all 5 digits.");
            return;
        }
        setIsSubmitting(true);
        const userId = user.id;

        try {
            const response = await fetch(
                `https://www.realvistamanagement.com/accounts/verify-email/${userId}/?code=${verificationCode}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                await response.json();
                setModalVisible(true);
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error);
            }
        } catch (err: unknown) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;
        const email = user.email;
        setIsSubmitting(true);

        try {
            const response = await fetch(
                "https://www.realvistamanagement.com/accounts/resend_token/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            if (response.ok) {
                const responseData = await response.json();
                Alert.alert("Success", responseData.success);
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error);
            }
        } catch (err: unknown) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setTimer(120);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
            setCanResend(false);
            return () => clearTimeout(countdown);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleContinue = () => {
        setModalVisible(false);
        router.replace("/(app)/(tabs)");
    };

    return (
        <View style={styles.container}>
            {isSubmitting && (
                <View style={{}}>
                    <ActivityIndicator size="large" color="#358B8B" />
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}

            {!isSubmitting && (
                <>
                    <View style={styles.header}>
                        <Text style={styles.title}>Email Verification</Text>
                        <Text style={styles.subtitle}>
                            Enter the 5-digit verification code we just sent to your email
                            address.
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.input}
                                value={digit}
                                onChangeText={(value) => handleInputChange(value, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                ref={(ref: TextInput | null) => {
                                    inputRefs.current[index] = ref; // assign only
                                }}
                            />
                        ))}
                    </View>

                    <Pressable style={styles.button} onPress={handleVerify}>
                        <Text style={styles.buttonText}>Verify</Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Didn’t receive a code?{" "}
                            <Text style={styles.resendText} onPress={handleResendCode}>
                                Resend
                            </Text>
                        </Text>
                        <Text style={styles.timer}>
                            Resend code in {Math.floor(timer / 60)}:
                            {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                        </Text>
                    </View>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Congratulations!</Text>
                                <Text style={styles.modalMessage}>
                                    Your email has been verified successfully.
                                </Text>
                                <Image source={images.welcome} />
                                <Pressable style={styles.continueButton} onPress={handleContinue}>
                                    <Text style={styles.buttonText}>Continue</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

export default VerifyEmail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    header: {
        marginBottom: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 40,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#358B8B',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#FB902E',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontFamily: 'Abel-Regular',
        fontSize: 18,
        fontWeight: '400',
        color: '#fff',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    resendText: {
        color: '#FB902E',
        fontWeight: 'bold',
        fontSize: 18
    },
    timer: {
        fontSize: 14,
        color: '#475569',
        marginTop: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#000',
        textAlign: 'center'
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F6B6666',
    },

    modalContainer: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    continueButton: {
        backgroundColor: '#FB902E',
        padding: 12,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
});
