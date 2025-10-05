import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Switch, Modal, Pressable } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

interface UserPreference {
    contact_by_email?: boolean;
    contact_by_phone?: boolean;
    contact_by_whatsapp?: boolean;
}

interface User {
    preference?: UserPreference;
}

interface GlobalContext {
    user?: User;
    reloadProfile: () => void;
}

interface Preferences {
    email: boolean;
    phone: boolean;
    whatsapp: boolean;
}

const UserPermissionSettings: React.FC = () => {
    const { user, reloadProfile } = useGlobalContext() as GlobalContext;
    const [preferences, setPreferences] = useState<Preferences>({
        email: false,
        phone: false,
        whatsapp: false,
    });
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (user?.preference) {
            setPreferences({
                email: user.preference.contact_by_email || false,
                phone: user.preference.contact_by_phone || false,
                whatsapp: user.preference.contact_by_whatsapp || false,
            });
        }
    }, [user]);

    const updatePreferences = async (key: keyof Preferences, value: boolean): Promise<void> => {
        try {
            const updatedPreferences = { ...preferences, [key]: value };

            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                console.error("Token is required for this operation");
                return;
            }

            const backendPreferences: UserPreference = {
                contact_by_email: updatedPreferences.email,
                contact_by_phone: updatedPreferences.phone,
                contact_by_whatsapp: updatedPreferences.whatsapp,
            };

            const response = await axios.put(
                "https://realvistamanagement.com/accounts/user/preferences/",
                backendPreferences,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setPreferences(updatedPreferences);
                reloadProfile();
            }
        } catch (error) {
            console.error("Error updating preferences:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.sectionHeader}>Contact Preferences</Text>
                <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color="#358B8B"
                    onPress={() => setModalVisible(true)}
                />
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Why Contact Preferences Matter</Text>
                        <Text style={styles.modalBody}>
                            Contact preferences determine how potential buyers or tenants can reach you.{" "}
                            By default, all permissions are set to "off" to prioritize your privacy.{" "}
                            Adjusting these settings is important if you have properties listed for sale{" "}
                            or rent on the platform.{"\n\n"}
                            If you don't have any properties listed, you don't need to worry about{" "}
                            contact preferences, as they won't affect your account.{" "}
                            Ensuring these settings reflect your needs will help align communication{" "}
                            preferences with your goals and privacy.
                        </Text>
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            <View style={styles.permissionItem}>
                <Text style={styles.label}>Allow Contact via Email</Text>
                <View style={{ transform: [{ scale: 1.2 }] }}>
                    <Switch
                        value={preferences.email}
                        onValueChange={(value) => updatePreferences("email", value)}
                        trackColor={{ false: "#767577", true: "#358B8B5A" }}
                        thumbColor={preferences.email ? "#358B8B" : "#f4f3f4"}
                    />
                </View>
            </View>

            <View style={styles.permissionItem}>
                <Text style={styles.label}>Allow Contact via WhatsApp</Text>
                <View style={{ transform: [{ scale: 1.2 }] }}>
                    <Switch
                        value={preferences.whatsapp}
                        onValueChange={(value) => updatePreferences("whatsapp", value)}
                        trackColor={{ false: "#767577", true: "#358B8B5A" }}
                        thumbColor={preferences.whatsapp ? "#358B8B" : "#f4f3f4"}
                    />
                </View>
            </View>
            <View style={styles.permissionItem}>
                <Text style={styles.label}>Allow Contact via Phone</Text>
                <View style={{ transform: [{ scale: 1.2 }] }}>
                    <Switch
                        value={preferences.phone}
                        onValueChange={(value) => updatePreferences("phone", value)}
                        trackColor={{ false: "#767577", true: "#358B8B5A" }}
                        thumbColor={preferences.phone ? "#358B8B" : "#f4f3f4"}
                    />
                </View>
            </View>
        </View>
    );
};

export default UserPermissionSettings;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
        marginBottom: 10
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "bold",
    },
    permissionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalBody: {
        fontSize: 14,
        marginBottom: 20,
        color: "#333",
    },
    closeButton: {
        alignSelf: "flex-end",
        padding: 10,
        backgroundColor: "#FB902E",
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});