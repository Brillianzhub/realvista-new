import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onClose }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleDeleteAccount = async (): Promise<void> => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("authToken");

            if (!token) {
                alert("Authentication token not found. Please log in again.");
                setLoading(false);
                return;
            }

            const deleteAccountUrl = "https://realvistamanagement.com/accounts/delete-account/";

            const response = await fetch(deleteAccountUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                alert("Success: " + (data.success ?? "Your request was processed successfully."));
                onClose(); // Close the modal after successful deletion request
            } else {
                alert("Error: " + (data.error || "Failed to process your request."));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Delete Account</Text>
                    <Text style={styles.message}>
                        Your account deletion request will be processed in 3 months. You will still have access
                        to your account until then, but we recommend deleting any saved documents as they will
                        no longer be recoverable after deletion.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteAccount}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Proceed</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#ccc",
        padding: 10,
        margin: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#d9534f",
        padding: 10,
        margin: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default DeleteAccountModal;
