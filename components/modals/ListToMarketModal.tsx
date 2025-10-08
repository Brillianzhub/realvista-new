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

type ListToMarketModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function ListToMarketModal({
    visible,
    onClose,
}: ListToMarketModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [property, setProperty] = useState('');
    const [listingPrice, setListingPrice] = useState('');
    const [listingType, setListingType] = useState('');
    const [availableDate, setAvailableDate] = useState('');
    const [description, setDescription] = useState('');
    const [amenities, setAmenities] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const handleSubmit = () => {
        console.log('Property listed to market:', {
            property,
            listingPrice,
            listingType,
            availableDate,
            description,
            amenities,
            contactEmail,
            contactPhone,
        });
        setProperty('');
        setListingPrice('');
        setListingType('');
        setAvailableDate('');
        setDescription('');
        setAmenities('');
        setContactEmail('');
        setContactPhone('');
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
                            List to Market
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
                                placeholder="Select property to list"
                                placeholderTextColor="#9CA3AF"
                                value={property}
                                onChangeText={setProperty}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Listing Price
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="$2,500/mo"
                                    placeholderTextColor="#9CA3AF"
                                    value={listingPrice}
                                    onChangeText={setListingPrice}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Listing Type
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="Rent/Sale"
                                    placeholderTextColor="#9CA3AF"
                                    value={listingType}
                                    onChangeText={setListingType}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Available Date
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor="#9CA3AF"
                                value={availableDate}
                                onChangeText={setAvailableDate}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Description
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                                placeholder="Describe your property for potential tenants/buyers"
                                placeholderTextColor="#9CA3AF"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>
                                Amenities
                            </Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="e.g., Pool, Parking, Gym, AC"
                                placeholderTextColor="#9CA3AF"
                                value={amenities}
                                onChangeText={setAmenities}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Contact Email
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="email@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={contactEmail}
                                    onChangeText={setContactEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={[styles.formGroup, styles.formGroupHalf]}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>
                                    Contact Phone
                                </Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="(555) 123-4567"
                                    placeholderTextColor="#9CA3AF"
                                    value={contactPhone}
                                    onChangeText={setContactPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Ionicons name="megaphone" size={20} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Publish Listing</Text>
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
        backgroundColor: '#EC4899',
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
