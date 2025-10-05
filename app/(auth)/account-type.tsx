// AccountType.tsx
import React from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";


const AccountType: React.FC = () => {
    const router = useRouter();
    const handleAccountSelection = (type: "basic" | "agent") => {
        if (type === "basic") {
            router.push("/(auth)/sign-up");
        } else {
            router.push("/(auth)/signupAgent");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Account Type</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => handleAccountSelection("basic")}
            >
                <Text style={styles.buttonText}>Basic Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.agentButton]}
                onPress={() => handleAccountSelection("agent")}
            >
                <Text style={styles.buttonAgentText}>Agent Account</Text>
            </TouchableOpacity>

            <Text style={styles.description}>
                Basic accounts are for regular users, while agent accounts have
                additional features for professionals.
            </Text>
        </View>
    );
};

export default AccountType;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 32,
        textAlign: "center",
    },
    button: {
        width: "100%",
        padding: 10,
        backgroundColor: "#FB902E",
        borderWidth: 1.5,
        borderColor: "#FB902E",
        borderRadius: 25,
        alignItems: "center",
        marginBottom: 16,
    },
    agentButton: {
        backgroundColor: "white",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    buttonAgentText: {
        color: "#FB902E",
        fontSize: 18,
        fontWeight: "600",
    },
    description: {
        marginTop: 32,
        textAlign: "center",
        color: "#666",
        lineHeight: 20,
    },
});
