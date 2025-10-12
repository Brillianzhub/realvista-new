import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PickerOption = {
    label: string;
    value: string;
};

type CustomPickerProps = {
    label: string;
    required?: boolean;
    placeholder?: string;
    options: PickerOption[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    error?: string;
};

export default function CustomPicker({
    label,
    required = false,
    placeholder = 'Select an option',
    options,
    selectedValue,
    onValueChange,
    error,
}: CustomPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
                style={[
                    styles.picker,
                    isDark && styles.pickerDark,
                    error && styles.pickerError,
                ]}
                onPress={() => setModalVisible(true)}
            >
                <Text
                    style={[
                        styles.pickerText,
                        isDark && styles.pickerTextDark,
                        !selectedValue && styles.placeholderText,
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                {label}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={isDark ? '#F9FAFB' : '#111827'}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsList}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.option,
                                        selectedValue === option.value && styles.selectedOption,
                                        isDark && styles.optionDark,
                                    ]}
                                    onPress={() => {
                                        onValueChange(option.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedValue === option.value && styles.selectedOptionText,
                                            isDark && styles.optionTextDark,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {selectedValue === option.value && (
                                        <Ionicons name="checkmark" size={20} color="#FB902E" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    labelDark: {
        color: '#E5E7EB',
    },
    required: {
        color: '#EF4444',
    },
    picker: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerDark: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
    },
    pickerError: {
        borderColor: '#EF4444',
    },
    pickerText: {
        fontSize: 16,
        color: '#111827',
        flex: 1,
    },
    pickerTextDark: {
        color: '#F9FAFB',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    modalContentDark: {
        backgroundColor: '#1F2937',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalTitleDark: {
        color: '#F9FAFB',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsList: {
        padding: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    optionDark: {
        backgroundColor: '#374151',
    },
    selectedOption: {
        backgroundColor: '#FFF7ED',
    },
    optionText: {
        fontSize: 16,
        color: '#111827',
        flex: 1,
    },
    optionTextDark: {
        color: '#F9FAFB',
    },
    selectedOptionText: {
        fontWeight: '600',
        color: '#FB902E',
    },
});
