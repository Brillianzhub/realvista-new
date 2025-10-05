import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";

interface Currency {
    label: string;
    value: string;
}

interface CurrencyModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    currencyTypes: Currency[];
    setFieldValue: (field: string, value: string) => void;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
    modalVisible,
    setModalVisible,
    currencyTypes,
    setFieldValue,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredCurrencies = currencyTypes.filter((currency) =>
        currency.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (value: string) => {
        setFieldValue("currency", value);
        setModalVisible(false);
    };

    return (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Select Currency</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search currency"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <FlatList
                            data={filteredCurrencies}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.currencyItem}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                        {/* 
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity> 
                        */}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
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
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    currencyItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
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
});

export default CurrencyModal;
