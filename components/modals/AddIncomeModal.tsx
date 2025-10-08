import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type AddIncomeModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function AddIncomeModal({
    visible,
    onClose,
}: AddIncomeModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [property, setProperty] = useState('');
    const [incomeType, setIncomeType] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [frequency, setFrequency] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        console.log('Income added:', {
            property,
            incomeType,
            amount,
            date,
            frequency,
            description,
        });
        setProperty('');
        setIncomeType('');
        setAmount('');
        setDate('');
        setFrequency('');
        setDescription('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                            Add Income
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Property
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Select or enter property name"
                                placeholderTextColor="#9CA3AF"
                                value={property}
                                onChangeText={setProperty}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Income Type
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="e.g., Rent, Security Deposit, Other"
                                placeholderTextColor="#9CA3AF"
                                value={incomeType}
                                onChangeText={setIncomeType}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Amount
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="$2,500"
                                    placeholderTextColor="#9CA3AF"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Date
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="MM/DD/YYYY"
                                    placeholderTextColor="#9CA3AF"
                                    value={date}
                                    onChangeText={setDate}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Frequency
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="e.g., Monthly, One-time, Quarterly"
                                placeholderTextColor="#9CA3AF"
                                value={frequency}
                                onChangeText={setFrequency}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Description
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                                placeholder="Additional notes about this income"
                                placeholderTextColor="#9CA3AF"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Add Income</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalContentDark: {
        backgroundColor: '#1F2937',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    modalTitleDark: {
        color: '#F9FAFB',
    },
    formGroup: {
        marginBottom: 20,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    formGroupHalf: {
        flex: 1,
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
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    inputDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        color: '#F9FAFB',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
