import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CoordinateForm, {
    Coordinate,
} from '@/components/forms/CoordinateForm';

type AddCoordinatesModalProps = {
    visible: boolean;
    onClose: () => void;
    onRefetch: () => void;

    mode?: 'add' | 'edit';
    propertyId?: string;
    coordinate?: Coordinate;
    coordinateId?: number;
};

export default function AddCoordinatesModal({
    visible,
    onClose,
    mode = 'add',
    propertyId,
    coordinate,
    coordinateId,
    onRefetch
}: AddCoordinatesModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSubmit = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                            {mode === 'edit' ? 'Edit Coordinate' : 'Add Coordinate'}
                        </Text>

                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>
                    <CoordinateForm
                        mode={mode}
                        initialPropertyId={propertyId}
                        initialCoordinate={coordinate}
                        coordinateId={coordinateId}
                        onSubmit={handleSubmit}
                        onClose={onClose}
                        onRefetch={onRefetch}
                    />
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
