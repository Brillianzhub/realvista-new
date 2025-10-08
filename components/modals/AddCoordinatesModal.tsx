// import {
//     View,
//     Text,
//     StyleSheet,
//     Modal,
//     TouchableOpacity,
//     TextInput,
//     useColorScheme,
// } from 'react-native';
// import { useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';

// type AddCoordinatesModalProps = {
//     visible: boolean;
//     onClose: () => void;
// };

// export default function AddCoordinatesModal({
//     visible,
//     onClose,
// }: AddCoordinatesModalProps) {
//     const colorScheme = useColorScheme();
//     const isDark = colorScheme === 'dark';

//     const [latitude, setLatitude] = useState('');
//     const [longitude, setLongitude] = useState('');

//     const handleSubmit = () => {
//         console.log('Coordinates submitted:', { latitude, longitude });
//         setLatitude('');
//         setLongitude('');
//         onClose();
//     };

//     return (
//         <Modal
//             visible={visible}
//             animationType="slide"
//             transparent={true}
//             onRequestClose={onClose}
//         >
//             <View style={styles.modalOverlay}>
//                 <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
//                     <View style={styles.modalHeader}>
//                         <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
//                             Add Coordinates
//                         </Text>
//                         <TouchableOpacity onPress={onClose}>
//                             <Ionicons
//                                 name="close"
//                                 size={28}
//                                 color={isDark ? '#E5E7EB' : '#374151'}
//                             />
//                         </TouchableOpacity>
//                     </View>

//                     <View style={[styles.mapPlaceholder, isDark && styles.mapPlaceholderDark]}>
//                         <Ionicons name="map-outline" size={64} color="#9CA3AF" />
//                         <Text style={styles.mapPlaceholderText}>
//                             Tap on map to select location
//                         </Text>
//                     </View>

//                     <View style={styles.formGroup}>
//                         <Text style={[styles.label, isDark && styles.labelDark]}>
//                             Latitude
//                         </Text>
//                         <TextInput
//                             style={[styles.input, isDark && styles.inputDark]}
//                             placeholder="e.g., 40.712776"
//                             placeholderTextColor="#9CA3AF"
//                             value={latitude}
//                             onChangeText={setLatitude}
//                             keyboardType="numeric"
//                         />
//                     </View>

//                     <View style={styles.formGroup}>
//                         <Text style={[styles.label, isDark && styles.labelDark]}>
//                             Longitude
//                         </Text>
//                         <TextInput
//                             style={[styles.input, isDark && styles.inputDark]}
//                             placeholder="e.g., -74.005974"
//                             placeholderTextColor="#9CA3AF"
//                             value={longitude}
//                             onChangeText={setLongitude}
//                             keyboardType="numeric"
//                         />
//                     </View>

//                     <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//                         <Text style={styles.submitButtonText}>Save Coordinates</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </Modal>
//     );
// }

// const styles = StyleSheet.create({
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         justifyContent: 'flex-end',
//     },
//     modalContent: {
//         backgroundColor: '#FFFFFF',
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//         padding: 24,
//         minHeight: 500,
//     },
//     modalContentDark: {
//         backgroundColor: '#1F2937',
//     },
//     modalHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     modalTitle: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: '#111827',
//     },
//     modalTitleDark: {
//         color: '#F9FAFB',
//     },
//     mapPlaceholder: {
//         backgroundColor: '#F3F4F6',
//         borderRadius: 16,
//         height: 200,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     mapPlaceholderDark: {
//         backgroundColor: '#374151',
//     },
//     mapPlaceholderText: {
//         marginTop: 12,
//         fontSize: 14,
//         color: '#9CA3AF',
//     },
//     formGroup: {
//         marginBottom: 20,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#374151',
//         marginBottom: 8,
//     },
//     labelDark: {
//         color: '#E5E7EB',
//     },
//     input: {
//         backgroundColor: '#F9FAFB',
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//         borderRadius: 12,
//         padding: 16,
//         fontSize: 16,
//         color: '#111827',
//     },
//     inputDark: {
//         backgroundColor: '#374151',
//         borderColor: '#4B5563',
//         color: '#F9FAFB',
//     },
//     submitButton: {
//         backgroundColor: '#14B8A6',
//         borderRadius: 12,
//         padding: 16,
//         alignItems: 'center',
//         marginTop: 8,
//     },
//     submitButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },
// });


import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CoordinateForm from '@/components/forms/CoordinateForm';

type AddCoordinatesModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function AddCoordinatesModal({
    visible,
    onClose,
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
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                            Add Coordinates
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>

                    <CoordinateForm onSubmit={handleSubmit} />
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
