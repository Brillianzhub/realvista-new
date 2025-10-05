import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    FlatList,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ListRenderItemInfo,
} from "react-native";
import CurrencyData from "@/assets/data/CurrencyData";

interface SelectCurrencyModalProps {
    visible: boolean;
    onClose: () => void;
    onCurrencySelect: (currencyCode: string) => void;
    selectedCurrency?: string;
}

type CurrencyEntry = [string, string];

const SelectCurrencyModal: React.FC<SelectCurrencyModalProps> = ({
    visible,
    onClose,
    onCurrencySelect,
    selectedCurrency,
}) => {
    const [searchText, setSearchText] = useState<string>("");
    const [filteredCurrencies, setFilteredCurrencies] = useState<CurrencyEntry[]>(
        Object.entries(CurrencyData.symbols)
    );

    const handleSearch = (text: string): void => {
        setSearchText(text);
        const filtered = Object.entries(CurrencyData.symbols).filter(([key, name]) =>
            name.toLowerCase().includes(text.toLowerCase()) ||
            key.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredCurrencies(filtered);
    };

    const renderCurrencyItem = ({ item }: ListRenderItemInfo<CurrencyEntry>) => (
        <TouchableOpacity
            style={styles.currencyItem}
            onPress={() => {
                onCurrencySelect(item[0]);
                setSearchText("");
                setFilteredCurrencies(Object.entries(CurrencyData.symbols));
            }}
        >
            <Text style={styles.currencyText}>{`${item[1]} (${item[0]})`}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Select Currency</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search currency"
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                        <FlatList
                            data={filteredCurrencies}
                            renderItem={renderCurrencyItem}
                            keyExtractor={(item) => item[0]}
                            showsVerticalScrollIndicator={false}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default SelectCurrencyModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "90%",
        maxHeight: "80%",
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    currencyItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    currencyText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#FB902E",
        borderRadius: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
});