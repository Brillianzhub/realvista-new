// import {
//     View,
//     Text,
//     StyleSheet,
//     Modal,
//     TouchableOpacity,
//     ScrollView,
//     useColorScheme,
//     Platform,
//     Alert,
// } from 'react-native';
// import { useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';

// type AddFilesModalProps = {
//     visible: boolean;
//     onClose: () => void;
// };

// type SelectedFile = {
//     uri: string;
//     name: string;
//     type: string;
// };

// export default function AddFilesModal({
//     visible,
//     onClose,
// }: AddFilesModalProps) {
//     const colorScheme = useColorScheme();
//     const isDark = colorScheme === 'dark';

//     const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

//     const handleImagePicker = async () => {
//         if (Platform.OS !== 'web') {
//             const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert(
//                     'Permission Required',
//                     'Sorry, we need camera roll permissions to upload images.'
//                 );
//                 return;
//             }
//         }

//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ['images'],
//             allowsMultipleSelection: true,
//             quality: 0.8,
//         });

//         if (!result.canceled) {
//             const newFiles: SelectedFile[] = result.assets.map((asset, index) => ({
//                 uri: asset.uri,
//                 name: `Image_${selectedFiles.length + index + 1}.jpg`,
//                 type: 'image/jpeg',
//             }));
//             setSelectedFiles([...selectedFiles, ...newFiles]);
//         }
//     };

//     const handleCameraPicker = async () => {
//         if (Platform.OS !== 'web') {
//             const { status } = await ImagePicker.requestCameraPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert(
//                     'Permission Required',
//                     'Sorry, we need camera permissions to take photos.'
//                 );
//                 return;
//             }
//         }

//         const result = await ImagePicker.launchCameraAsync({
//             quality: 0.8,
//         });

//         if (!result.canceled) {
//             const newFile: SelectedFile = {
//                 uri: result.assets[0].uri,
//                 name: `Photo_${selectedFiles.length + 1}.jpg`,
//                 type: 'image/jpeg',
//             };
//             setSelectedFiles([...selectedFiles, newFile]);
//         }
//     };

//     const handleRemoveFile = (index: number) => {
//         setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
//     };

//     const handleSubmit = () => {
//         console.log('Files uploaded:', selectedFiles);
//         Alert.alert('Success', `${selectedFiles.length} file(s) uploaded successfully`);
//         setSelectedFiles([]);
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
//                             Add Files & Images
//                         </Text>
//                         <TouchableOpacity onPress={onClose}>
//                             <Ionicons
//                                 name="close"
//                                 size={28}
//                                 color={isDark ? '#E5E7EB' : '#374151'}
//                             />
//                         </TouchableOpacity>
//                     </View>

//                     <ScrollView showsVerticalScrollIndicator={false}>
//                         <View style={styles.uploadOptions}>
//                             <TouchableOpacity
//                                 style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
//                                 onPress={handleImagePicker}
//                             >
//                                 <View style={styles.uploadIconContainer}>
//                                     <Ionicons name="images-outline" size={32} color="#3B82F6" />
//                                 </View>
//                                 <Text style={[styles.uploadButtonText, isDark && styles.uploadButtonTextDark]}>
//                                     Choose from Gallery
//                                 </Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
//                                 onPress={handleCameraPicker}
//                             >
//                                 <View style={styles.uploadIconContainer}>
//                                     <Ionicons name="camera-outline" size={32} color="#10B981" />
//                                 </View>
//                                 <Text style={[styles.uploadButtonText, isDark && styles.uploadButtonTextDark]}>
//                                     Take Photo
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>

//                         {selectedFiles.length > 0 && (
//                             <>
//                                 <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
//                                     Selected Files ({selectedFiles.length})
//                                 </Text>
//                                 <View style={styles.fileList}>
//                                     {selectedFiles.map((file, index) => (
//                                         <View
//                                             key={index}
//                                             style={[styles.fileItem, isDark && styles.fileItemDark]}
//                                         >
//                                             <View style={styles.fileInfo}>
//                                                 <Ionicons
//                                                     name="document"
//                                                     size={24}
//                                                     color={isDark ? '#9CA3AF' : '#6B7280'}
//                                                 />
//                                                 <Text
//                                                     style={[styles.fileName, isDark && styles.fileNameDark]}
//                                                     numberOfLines={1}
//                                                 >
//                                                     {file.name}
//                                                 </Text>
//                                             </View>
//                                             <TouchableOpacity onPress={() => handleRemoveFile(index)}>
//                                                 <Ionicons name="close-circle" size={24} color="#EF4444" />
//                                             </TouchableOpacity>
//                                         </View>
//                                     ))}
//                                 </View>
//                             </>
//                         )}

//                         {selectedFiles.length === 0 && (
//                             <View style={styles.emptyState}>
//                                 <Ionicons name="cloud-upload-outline" size={64} color="#9CA3AF" />
//                                 <Text style={styles.emptyStateText}>
//                                     No files selected yet
//                                 </Text>
//                             </View>
//                         )}

//                         <TouchableOpacity
//                             style={[
//                                 styles.submitButton,
//                                 selectedFiles.length === 0 && styles.submitButtonDisabled,
//                             ]}
//                             onPress={handleSubmit}
//                             disabled={selectedFiles.length === 0}
//                         >
//                             <Ionicons
//                                 name="cloud-upload"
//                                 size={20}
//                                 color={selectedFiles.length > 0 ? '#FFFFFF' : '#9CA3AF'}
//                             />
//                             <Text
//                                 style={[
//                                     styles.submitButtonText,
//                                     selectedFiles.length === 0 && styles.submitButtonTextDisabled,
//                                 ]}
//                             >
//                                 Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : 'Files'}
//                             </Text>
//                         </TouchableOpacity>
//                     </ScrollView>
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
//         maxHeight: '90%',
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
//     uploadOptions: {
//         flexDirection: 'row',
//         gap: 12,
//         marginBottom: 24,
//     },
//     uploadButton: {
//         flex: 1,
//         backgroundColor: '#F9FAFB',
//         borderRadius: 16,
//         padding: 20,
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: '#E5E7EB',
//         borderStyle: 'dashed',
//     },
//     uploadButtonDark: {
//         backgroundColor: '#374151',
//         borderColor: '#4B5563',
//     },
//     uploadIconContainer: {
//         marginBottom: 8,
//     },
//     uploadButtonText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#374151',
//         textAlign: 'center',
//     },
//     uploadButtonTextDark: {
//         color: '#E5E7EB',
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#111827',
//         marginBottom: 12,
//     },
//     sectionTitleDark: {
//         color: '#F9FAFB',
//     },
//     fileList: {
//         gap: 8,
//         marginBottom: 24,
//     },
//     fileItem: {
//         backgroundColor: '#F9FAFB',
//         borderRadius: 12,
//         padding: 12,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     fileItemDark: {
//         backgroundColor: '#374151',
//     },
//     fileInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//         flex: 1,
//     },
//     fileName: {
//         fontSize: 14,
//         color: '#374151',
//         flex: 1,
//     },
//     fileNameDark: {
//         color: '#E5E7EB',
//     },
//     emptyState: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 40,
//     },
//     emptyStateText: {
//         fontSize: 16,
//         color: '#9CA3AF',
//         marginTop: 12,
//     },
//     submitButton: {
//         backgroundColor: '#F97316',
//         borderRadius: 12,
//         padding: 16,
//         alignItems: 'center',
//         flexDirection: 'row',
//         justifyContent: 'center',
//         gap: 8,
//         marginTop: 8,
//         marginBottom: 20,
//     },
//     submitButtonDisabled: {
//         backgroundColor: '#E5E7EB',
//     },
//     submitButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     submitButtonTextDisabled: {
//         color: '#9CA3AF',
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
import DocumentUploader from '@/components/utils/DocumentUploader';

type AddFilesModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function AddFilesModal({
    visible,
    onClose,
}: AddFilesModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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
                            Add Files & Images
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>
                    <DocumentUploader onClose={onClose} />
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
