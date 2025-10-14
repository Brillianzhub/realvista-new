import React, { useState } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyData from "@/assets/data/CurrencyData";
import SelectCurrencyModal from "./SelectCurrencyModal";

type CurrencyKey = Extract<keyof typeof CurrencyData.symbols, string>;

const CurrencySettings: React.FC = () => {
    const { currency, setCurrency } = useCurrency();
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const handleCurrencySelect = (key: CurrencyKey) => {
        setCurrency(key);
        setModalVisible(false);
        Alert.alert("Currency Updated", `Your preferred currency is now set to ${key}`);
    };

    return (
        <View style={styles.settingItem}>
            <Text style={styles.label}>Preferred Currency</Text>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.selectedCurrency}>
                    {`${CurrencyData.symbols[currency]} (${currency})`}
                </Text>
            </TouchableOpacity>

            <SelectCurrencyModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCurrencySelect={handleCurrencySelect}
                selectedCurrency={currency}
            />
        </View>
    );
};

export default CurrencySettings;

const styles = StyleSheet.create({
    settingItem: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    selectedCurrency: {
        fontSize: 16,
    },
});
