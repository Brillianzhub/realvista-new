import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "@/context/GlobalProvider";

interface SubmitReferralModalProps {
    visible: boolean;
    onClose: () => void;
}

interface ReferralResponse {
    message?: string;
    success?: string;
    [key: string]: any; // fallback in case backend sends extra fields
}

const SubmitReferralModal: React.FC<SubmitReferralModalProps> = ({ visible, onClose }) => {
    const [referrerCode, setReferrerCode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const { reloadProfile } = useGlobalContext();

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem("authToken");
            setAuthToken(token);
        };
        getToken();
    }, []);

    const handleSubmit = async (): Promise<void> => {
        if (!referrerCode.trim()) {
            Alert.alert("Error", "Please enter a referrer code.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("https://www.realvistamanagement.com/accounts/submit-referral/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authToken}`,
                },
                body: JSON.stringify({ referrer_code: referrerCode }),
            });

            const data: ReferralResponse = await response.json();
            reloadProfile();

            if (response.ok) {
                Alert.alert("Success", "Referral code submitted successfully!");
                onClose();
            } else {
                Alert.alert("Error", data.message || "Failed to submit referral code.");
            }
        } catch (error) {
            console.error("Referral submission error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}>
                    <TouchableWithoutFeedback>
                        <View style={{
                            width: 300,
                            padding: 20,
                            backgroundColor: "white",
                            borderRadius: 10
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10
                            }}>
                                Enter Referrer Code
                            </Text>
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                    padding: 10,
                                    borderRadius: 5,
                                    marginBottom: 10
                                }}
                                placeholder="Referrer Code"
                                value={referrerCode}
                                onChangeText={setReferrerCode}
                            />
                            {loading ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={{
                                        backgroundColor: "#FB902E",
                                        padding: 10,
                                        borderRadius: 5,
                                        alignItems: "center"
                                    }}
                                >
                                    <Text style={{
                                        color: "white",
                                        fontWeight: "bold"
                                    }}>
                                        Submit
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={onClose}
                                style={{ marginTop: 10, alignItems: "center" }}
                            >
                                <Text style={{ color: "red" }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default SubmitReferralModal;
