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

type UpdatePropertyModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function UpdatePropertyModal({
    visible,
    onClose,
}: UpdatePropertyModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [selectedProperty, setSelectedProperty] = useState('');
    const [propertyName, setPropertyName] = useState('');
    const [address, setAddress] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [squareFeet, setSquareFeet] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        console.log('Property updated:', {
            selectedProperty,
            propertyName,
            address,
            propertyType,
            currentValue,
            squareFeet,
            bedrooms,
            bathrooms,
            notes,
        });
        setSelectedProperty('');
        setPropertyName('');
        setAddress('');
        setPropertyType('');
        setCurrentValue('');
        setSquareFeet('');
        setBedrooms('');
        setBathrooms('');
        setNotes('');
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
                            Update Property
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
                                Select Property
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Choose property to update"
                                placeholderTextColor="#9CA3AF"
                                value={selectedProperty}
                                onChangeText={setSelectedProperty}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Property Name
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="e.g., Downtown Apartment"
                                placeholderTextColor="#9CA3AF"
                                value={propertyName}
                                onChangeText={setPropertyName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Address
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Full address"
                                placeholderTextColor="#9CA3AF"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Property Type
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="Type"
                                    placeholderTextColor="#9CA3AF"
                                    value={propertyType}
                                    onChangeText={setPropertyType}
                                />
                            </View>

                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Current Value
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="$300,000"
                                    placeholderTextColor="#9CA3AF"
                                    value={currentValue}
                                    onChangeText={setCurrentValue}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, styles.formGroupThird]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Sq Ft
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="1200"
                                    placeholderTextColor="#9CA3AF"
                                    value={squareFeet}
                                    onChangeText={setSquareFeet}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.formGroup, styles.formGroupThird]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Beds
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="3"
                                    placeholderTextColor="#9CA3AF"
                                    value={bedrooms}
                                    onChangeText={setBedrooms}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.formGroup, styles.formGroupThird]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Baths
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="2"
                                    placeholderTextColor="#9CA3AF"
                                    value={bathrooms}
                                    onChangeText={setBathrooms}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Notes
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                                placeholder="Additional updates or notes"
                                placeholderTextColor="#9CA3AF"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Ionicons name="save" size={20} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Update Property</Text>
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
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
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
    formGroupThird: {
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
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#8B5CF6',
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
