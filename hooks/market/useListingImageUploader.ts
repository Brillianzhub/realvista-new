import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const useImageUploader = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    /**
     * Uploads image(s) to the backend for a specific property.
     * 
     * @param propertyId number | string — the backend property ID (not prefixed with backend_)
     * @param imageUris string[] — list of local file URIs to upload
     */
    const uploadImages = async (propertyId: number | string, imageUris: string[]) => {
        if (!imageUris?.length) {
            console.warn('No images provided for upload.');
            return;
        }

        // 🧩 Filter out images that are already hosted remotely (e.g., S3 URLs)
        const localImages = imageUris.filter(uri => uri.startsWith('file://'));

        if (localImages.length === 0) {
            console.log('No new local images to upload.');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token required!');
                return;
            }

            for (let i = 0; i < localImages.length; i++) {
                const fileUri = localImages[i];

                const formData = new FormData();
                formData.append('property', String(propertyId));
                formData.append('file', {
                    uri: fileUri,
                    name: fileUri.split('/').pop(),
                    type: 'image/jpeg',
                } as any);

                await axios.post(
                    'https://realvistamanagement.com/market/upload-file-market/',
                    formData,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                            setProgress(percent);
                        },
                    }
                );

                console.log(`✅ Uploaded local image ${i + 1}/${localImages.length}`);
            }

            Alert.alert('Success', `${localImages.length} new image(s) uploaded successfully.`);
        } catch (error: any) {
            console.error('Error uploading images:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
            setProgress(100);
        }
    };

    return { uploadImages, uploading, progress };
};
