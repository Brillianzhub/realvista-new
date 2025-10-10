import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropertyIncomeForm from '@/components/forms/PropertyIncomeForm';

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

    const handleSubmit = () => {
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

                <View
                    style={[
                        styles.modalContent,
                        isDark && styles.modalContentDark,
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text
                            style={[
                                styles.modalTitle,
                                isDark && styles.modalTitleDark,
                            ]}
                        >
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
                    <PropertyIncomeForm onSubmit={handleSubmit} />
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
    keyboardAvoidingView: {
        // flex: 1,
        paddingBottom: 60,
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
    scrollContent: {
        paddingBottom: 40,
    },
});
