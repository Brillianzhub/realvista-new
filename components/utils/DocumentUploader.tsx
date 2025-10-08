import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserProperties from '@/hooks/portfolio/useUserProperty';


interface DocumentFile {
    uri: string;
    type: string;
    name: string;
    size: number;
}

interface Property {
    id: string;
    title: string;
}

interface DocumentUploaderProps {
    propertyId?: string | null;
    onClose?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ propertyId, onClose }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [property, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
        propertyId || null
    );
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);

    const { properties, loading: propertiesLoading } = useUserProperties();


    const selectDocuments = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
            });

            if (result.canceled) {
                return;
            }

            const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'mp3', 'mp4'];
            const maxFileSize = 10 * 1024 * 1024;

            const selectedDocuments = result.assets
                .filter((asset) => {
                    const name = asset.name || `file_${Date.now()}`;
                    const extension = name.split('.').pop()?.toLowerCase() || '';

                    if (!allowedTypes.includes(extension)) {
                        Alert.alert(
                            'Invalid File Type',
                            `The file "${name}" is not allowed. Only PDF, JPG, JPEG, PNG, MP3, and MP4 files are supported.`
                        );
                        return false;
                    }

                    if ((asset.size || 0) > maxFileSize) {
                        Alert.alert(
                            'File Too Large',
                            `The file "${name}" exceeds the 10MB size limit.`
                        );
                        return false;
                    }

                    return true;
                })
                .map((asset) => {
                    const uri = asset.uri;
                    const name = asset.name || `file_${Date.now()}`;
                    const extension = name.split('.').pop()?.toLowerCase() || '';

                    let type = 'application/octet-stream';
                    if (['jpg', 'jpeg', 'png'].includes(extension)) {
                        type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                    } else if (extension === 'pdf') {
                        type = 'application/pdf';
                    } else if (extension === 'mp3') {
                        type = 'audio/mpeg';
                    } else if (extension === 'mp4') {
                        type = 'video/mp4';
                    }

                    const fileName = name.includes('.') ? name : `${name}.${extension}`;

                    return {
                        uri,
                        type,
                        name: fileName,
                        size: asset.size || 0,
                    };
                });

            setDocuments([...documents, ...selectedDocuments]);
        } catch (error) {
            console.error('Error selecting documents:', error);
            Alert.alert('Error', 'Failed to select documents. Please try again.');
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const uploadDocuments = async () => {
        if (documents.length === 0) {
            Alert.alert('No Files', 'Please select documents to upload.');
            return;
        }

        if (!selectedPropertyId) {
            Alert.alert('No Property Selected', 'Please select a property to upload documents to.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('property', selectedPropertyId);

        documents.forEach((file) => {
            const fileData = {
                uri: file.uri,
                type: file.type,
                name: file.name,
            } as any;
            formData.append('file', fileData);
        });

        try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to upload files.');
                setLoading(false);
                return;
            }

            const response = await fetch(
                'https://realvistamanagement.com/portfolio/upload-file-portfolio/',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
            }

            Alert.alert('Success', 'Documents uploaded successfully!');
            setDocuments([]);
            onClose?.();

        } catch (error: any) {
            console.error('Upload error:', error);
            if (error.message?.includes('Network request failed')) {
                Alert.alert(
                    'Network Error',
                    'No response from the server. Please check your network connection.'
                );
            } else {
                Alert.alert(
                    'Upload Failed',
                    error.message || 'Failed to upload documents. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const getSelectedPropertyTitle = () => {
        const property = properties.find(
            (p) => p.id === Number(selectedPropertyId)
        );
        return property ? property.title : 'Select a property';
    };


    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
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
                        <FlatList
                            data={properties}
                            keyExtractor={(item) => item.id.toString()}
                            style={styles.pickerScroll}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setSelectedPropertyId(item.id.toString());
                                        setShowPropertyPicker(false);
                                    }}
                                >
                                    <Text style={[styles.pickerOptionText, isDark && styles.pickerOptionTextDark]}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.selectButton, isDark && styles.selectButtonDark]}
                onPress={selectDocuments}
            >
                <Ionicons name="document-attach" size={20} color="#FB902E" />
                <Text style={styles.selectButtonText}>Select Files</Text>
            </TouchableOpacity>

            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                Maximum file size is 10MB. Ensure files are named accordingly, as these names
                will be used to list the files. This applies to documents and not necessarily to
                images. Supported file types: PDF, JPG, JPEG, PNG, MP3, and MP4.
            </Text>

            {documents.length > 0 && (
                <View style={styles.filesContainer}>
                    <Text style={[styles.filesTitle, isDark && styles.filesTitleDark]}>
                        Selected Files ({documents.length})
                    </Text>
                    <FlatList
                        data={documents}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={[styles.fileItem, isDark && styles.fileItemDark]}>
                                <View style={styles.fileInfo}>
                                    <Ionicons
                                        name={
                                            item.type.startsWith('image/')
                                                ? 'image'
                                                : item.type === 'application/pdf'
                                                    ? 'document-text'
                                                    : item.type.startsWith('audio/')
                                                        ? 'musical-notes'
                                                        : item.type.startsWith('video/')
                                                            ? 'videocam'
                                                            : 'document'
                                        }
                                        size={24}
                                        color={isDark ? '#9CA3AF' : '#6B7280'}
                                    />
                                    <View style={styles.fileDetails}>
                                        <Text style={[styles.fileName, isDark && styles.fileNameDark]}>
                                            {item.name}
                                        </Text>
                                        <Text style={[styles.fileSize, isDark && styles.fileSizeDark]}>
                                            {formatFileSize(item.size)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeDocument(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.uploadButton,
                    (loading || documents.length === 0 || !selectedPropertyId) &&
                    styles.disabledButton,
                ]}
                onPress={uploadDocuments}
                disabled={loading || documents.length === 0 || !selectedPropertyId}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                        <Text style={styles.uploadButtonText}>Upload Files</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default DocumentUploader;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
    },
    formGroup: {
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
    selectButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#FB902E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    selectButtonDark: {
        backgroundColor: '#374151',
    },
    selectButtonText: {
        color: '#FB902E',
        fontSize: 16,
        fontWeight: '600',
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'justify',
        marginBottom: 20,
        lineHeight: 20,
    },
    infoTextDark: {
        color: '#9CA3AF',
    },
    filesContainer: {
        marginBottom: 20,
    },
    filesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    filesTitleDark: {
        color: '#E5E7EB',
    },
    fileItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fileItemDark: {
        backgroundColor: '#374151',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 2,
    },
    fileNameDark: {
        color: '#F9FAFB',
    },
    fileSize: {
        fontSize: 12,
        color: '#6B7280',
    },
    fileSizeDark: {
        color: '#9CA3AF',
    },
    removeButton: {
        padding: 4,
    },
    uploadButton: {
        backgroundColor: '#FB902E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
        opacity: 0.6,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
