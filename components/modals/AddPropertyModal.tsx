import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropertyForm, { PropertyFormData } from '@/components/forms/PropertyForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type AddPropertyModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function AddPropertyModal({
    visible,
    onClose,
}: AddPropertyModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSubmit = async (data: PropertyFormData) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token required!');
                return;
            }

            const response = await axios.post(
                'https://www.realvistamanagement.com/portfolio/properties/add/',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );

            Alert.alert('Success', 'Property added successfully!');
            onClose();
        } catch (error: any) {
            console.error('Error adding property:', error.response?.data || error.message);
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Failed to add property. Please try again.'
            );
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
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                            Add Property
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>

                    <PropertyForm onSubmit={handleSubmit} />
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
});
