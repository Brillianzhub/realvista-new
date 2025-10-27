import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useUserProperties from '@/hooks/portfolio/useUserProperty';

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

    const { properties, loading: propertiesLoading } = useUserProperties();
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        property: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const getSelectedPropertyTitle = () => {
        const property = properties.find(
            (p) => p.id === Number(selectedPropertyId)
        );
        return property ? property.title : 'Select a property';
    };

    const handleListForSale = async () => {
        if (!selectedProperty) {
            setErrors({ property: 'Please select a property' });
            return;
        }

        try {
            router.push({
                pathname: '/(app)/(listings)/listing-workflow',
                params: {
                    new: 'true',
                    portfolioProperty: JSON.stringify(selectedProperty),
                },
            });
            onClose();
        } catch (error) {
            console.error('Error creating listing:', error);
            Alert.alert('Error', 'Failed to create listing');
        }
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
                    {/* HEADER */}
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

                    {/* PROPERTY SELECT */}
                    <Text style={[styles.label, isDark && styles.labelDark]}>
                        Select Property <Text style={styles.required}>*</Text>
                    </Text>

                    <TouchableOpacity
                        style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                        onPress={() => setShowPropertyPicker(!showPropertyPicker)}
                    >
                        <Text
                            style={[
                                styles.pickerButtonText,
                                isDark && styles.pickerButtonTextDark,
                                !selectedPropertyId && styles.placeholderText,
                            ]}
                        >
                            {getSelectedPropertyTitle()}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                    </TouchableOpacity>

                    {showPropertyPicker && (
                        <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                            <View style={styles.pickerScroll}>
                                {properties.map((item) => (
                                    <TouchableOpacity
                                        key={item.id.toString()}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            setSelectedPropertyId(item.id.toString());
                                            setSelectedProperty(item);
                                            setFormData((prev) => ({ ...prev, property: item.id.toString() }));
                                            setShowPropertyPicker(false);
                                            setErrors({});
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.pickerOptionText,
                                                isDark && styles.pickerOptionTextDark,
                                            ]}
                                        >
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {errors.property && (
                        <Text style={styles.errorText}>{errors.property}</Text>
                    )}

                    {/* ACTION BUTTON */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (isSubmitting || !selectedPropertyId) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleListForSale}
                        disabled={isSubmitting || !selectedPropertyId}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.submitButtonText}>Submit Expense</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
        minHeight: '45%',

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
    pickerButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerButtonTextDark: {
        color: '#F9FAFB',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pickerContainerDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    pickerScroll: {
        maxHeight: 200,
    },
    pickerOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerOptionTextDark: {
        color: '#F9FAFB',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#FB902E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
