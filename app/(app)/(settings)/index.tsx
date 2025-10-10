import React from "react";
import { StyleSheet, View } from "react-native";
import CurrencySettings from "@/components/settings/CurrencySettings";
import UserPermissionSettings from "@/components/settings/UserPermissionSettings";

const Settings: React.FC = () => {
    return (
        <View style={styles.container}>
            <CurrencySettings />
            <UserPermissionSettings />
        </View>
    );
};

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#ffffff",
    },
});
