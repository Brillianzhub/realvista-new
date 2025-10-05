import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';

const { height: deviceHeight } = Dimensions.get('window');

interface Option {
    label: string;
    value: string | number;
}

interface PropertyTypePickerProps {
    options: Option[];
    selectedValue?: string | number | null;
    onValueChange: (value: string | number) => void;
    label?: string;
    required?: boolean;
    placeholder?: string;
}

const CustomPicker: React.FC<PropertyTypePickerProps> = ({
    options,
    selectedValue,
    onValueChange,
    label,
    required = false,
    placeholder = 'Select an option',
}) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const handleSelection = (value: string | number) => {
        onValueChange(value);
        setModalVisible(false);
    };

    return (
        <View style={{ marginBottom: 16 }}>
            {label && (
                <Text style={styles.label}>
                    {label} {required && <Text style={{ color: 'red' }}>*</Text>}
                </Text>
            )}

            <TouchableOpacity
                style={[styles.input, styles.touchable]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={{ color: selectedValue ? '#000' : '#aaa' }}>
                    {options.find((item) => item.value === selectedValue)?.label || placeholder}
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Option</Text>
                                <ScrollView
                                    contentContainerStyle={styles.scrollViewContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {options.map((item) => (
                                        <TouchableOpacity
                                            key={item.value}
                                            style={styles.listItem}
                                            onPress={() => handleSelection(item.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.listItemText,
                                                    selectedValue === item.value && styles.selectedItemText,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 15,
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    touchable: {
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: deviceHeight * 0.7,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    scrollViewContent: {
        paddingBottom: 16,
    },
    listItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    listItemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedItemText: {
        fontWeight: 'bold',
        color: '#358B8B',
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#FB902E',
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CustomPicker;
