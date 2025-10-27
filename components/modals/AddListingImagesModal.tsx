import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import { useListingLoader } from '@/utils/market/useListingLoader';
import { useGlobalContext } from '@/context/GlobalProvider';
import useFetchVendorProperties from '@/hooks/market/useVendorListing';
import { useImageUploader } from '@/hooks/market/useListingImageUploader';
import { useDeleteImage } from '@/hooks/market/useDeleteImage';


type AddListingImagesModalProps = {
    visible: boolean;
    listingId: string | null;
    onClose: () => void;
    mode: 'create' | 'update';
};

export default function AddListingImagesModal({
    visible,
    listingId,
    onClose,
    mode
}: AddListingImagesModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [imageObjects, setImageObjects] = useState<{ id: number; url: string }[]>([]);

    const { uploadImages, uploading, progress } = useImageUploader();

    const [pendingImages, setPendingImages] = useState<string[]>([]);

    const { user } = useGlobalContext();
    const { properties } = useFetchVendorProperties(user?.email || null);

    const { } = useListingLoader({
        listingId: listingId ?? null,
        properties,
        onListingLoaded: (listing) => {
            if (listing && listing.images) {
                setImages(listing.images);
            };

            if (listing.image_objects) {
                const objs = listing.image_objects;
                if (Array.isArray(objs)) {
                    setImageObjects(objs as { id: number; url: string }[]);
                } else if (objs && typeof objs === 'object') {
                    setImageObjects(Object.values(objs) as { id: number; url: string }[]);
                } else {
                    setImageObjects([]);
                }
            };
        },
    });

    const { deleteImage, error } = useDeleteImage();
    
    const pickImages = async () => {
        if (!listingId) {
            Alert.alert('Error', 'No listing selected');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
                setLoading(true);

                const allowedTypes = ['jpg', 'jpeg', 'png', 'heic', 'heif'];
                const maxFileSize = 10 * 1024 * 1024;
                const validImages: string[] = [];
                const errors: string[] = [];

                for (const asset of result.assets) {
                    const uri = asset.uri;
                    const fileName = asset.fileName || uri.split('/').pop() || `image_${Date.now()}`;
                    const extension = fileName.split('.').pop()?.toLowerCase() || '';

                    if (!allowedTypes.includes(extension)) {
                        errors.push(`"${fileName}" is not allowed. Only JPG, JPEG, and PNG files are supported.`);
                        continue;
                    }

                    const fileSize = asset.fileSize || 0;
                    if (fileSize > maxFileSize) {
                        errors.push(`"${fileName}" exceeds the 10MB size limit.`);
                        continue;
                    }

                    validImages.push(uri);
                }

                if (errors.length > 0) {
                    Alert.alert('Some files were not added', errors.join('\n\n'));
                }

                if (validImages.length > 0) {
                    const allImages = [...images, ...validImages];

                    if (mode === 'create') {
                        await saveImages(allImages);
                    } else {
                        setPendingImages(allImages);
                    };

                    setImages(allImages);
                    Alert.alert('Success', `${validImages.length} image(s) added successfully`);
                } else if (errors.length === 0) {
                    Alert.alert('Error', 'No valid images selected');
                }
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to add images');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = async (imageUri: string) => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (mode === 'create') {
                                // 🟢 CREATE MODE: remove and save immediately
                                const updatedImages = images.filter((img) => img !== imageUri);
                                await saveImages(updatedImages);
                                setImages(updatedImages);
                            } else {
                                // 🔵 UPDATE MODE
                                if (imageUri.startsWith('file://')) {
                                    // Local pending image
                                    const updatedPending = pendingImages.filter((img) => img !== imageUri);
                                    setPendingImages(updatedPending);
                                    console.log('🗑️ Removed local pending image:', imageUri);
                                } else {
                                    // Backend image → find its ID from imageObjects
                                    const imageObj = imageObjects.find((obj) => obj.url === imageUri);

                                    if (imageObj) {
                                        const fileId = imageObj.id;
                                        console.log(`🗑️ Deleting backend image (id=${fileId}):`, imageUri);

                                        // ✅ Use the delete hook
                                        const success = await deleteImage(fileId);

                                        if (success) {
                                            // Remove from local state only if deletion succeeded
                                            const updatedImageObjects = imageObjects.filter((obj) => obj.id !== fileId);
                                            setImageObjects(updatedImageObjects);

                                            const updatedPending = pendingImages.filter((img) => img !== imageUri);
                                            setPendingImages(updatedPending);

                                            console.log("✅ Image deleted successfully and removed from state");
                                        } else {
                                            Alert.alert("Error", "Failed to delete image from server");
                                        }
                                    } else {
                                        console.warn("⚠️ Image not found in imageObjects:", imageUri);
                                    }
                                }

                            }
                        } catch (error) {
                            console.error('❌ Error removing image:', error);
                            Alert.alert('Error', 'Failed to remove image');
                        }
                    },
                },
            ]
        );
    };



    const setAsThumbnail = async (imageUri: string) => {
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (!storedListings) return;

            const listings: MarketplaceListing[] = JSON.parse(storedListings);
            const index = listings.findIndex((l) => l.id === listingId);

            if (index === -1) return;

            listings[index] = {
                ...listings[index],
                thumbnail_url: imageUri,
                updated_at: new Date().toISOString(),
            };

            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));
            Alert.alert('Success', 'Thumbnail updated successfully');
        } catch (error) {
            console.error('Error setting thumbnail:', error);
            Alert.alert('Error', 'Failed to set thumbnail');
        }
    };

    const saveImages = async (updatedImages: string[]) => {
        if (!listingId) return;

        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (!storedListings) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            const listings: MarketplaceListing[] = JSON.parse(storedListings);
            const index = listings.findIndex((l) => l.id === listingId);

            if (index === -1) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            listings[index] = {
                ...listings[index],
                images: updatedImages,
                thumbnail_url: listings[index].thumbnail_url || updatedImages[0] || '',
                current_step: Math.max(listings[index].current_step, 2),
                completion_percentage: calculateCompletion(listings[index], updatedImages),
                updated_at: new Date().toISOString(),
            };

            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));
        } catch (error) {
            throw error;
        }
    };


    const handleUpdateFiles = async () => {
        if (pendingImages.length === 0) {
            Alert.alert('No new images selected', 'Please add images before updating.')
        };
        setLoading(true);

        try {

            let backendId = listingId;

            if (typeof backendId === 'string' && backendId.startsWith('backend_')) {
                backendId = backendId.replace('backend_', '')
            };

            await uploadImages(Number(backendId), pendingImages)

            Alert.alert('Success', 'Images updated succesfully');
            setPendingImages([]);
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update images for the listing')
        } finally {
            setLoading(false);
        };
    };

    const calculateCompletion = (listing: MarketplaceListing, images: string[]) => {
        const steps = {
            basicInfo: !!(listing.property_name && listing.property_type && listing.location && listing.city && listing.state),
            images: images.length > 0,
            location: !!(listing.latitude && listing.longitude),
            features: !!listing.features,
            published: listing.status === 'Published',
        };

        const completedSteps = Object.values(steps).filter(Boolean).length;
        return Math.round((completedSteps / 5) * 100);
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
                            Property Images
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Add high-quality photos to showcase your property. The first image will be the main thumbnail.
                            {'\n\n'}
                            Maximum file size is 10MB. Supported file types: JPG, JPEG, and PNG.
                        </Text>

                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={pickImages}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload-outline" size={32} color="#FFFFFF" />
                                    <Text style={styles.uploadButtonText}>Select Images</Text>
                                    <Text style={styles.uploadButtonSubtext}>
                                        You can select multiple images
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {images.length > 0 && (
                            <>
                                <View style={styles.imageCountContainer}>
                                    <Text style={[styles.imageCount, isDark && styles.imageCountDark]}>
                                        {images.length} image{images.length !== 1 ? 's' : ''} added
                                    </Text>
                                </View>

                                <View style={styles.imageGrid}>
                                    {images.map((imageUri, index) => (
                                        <View key={index} style={styles.imageCard}>
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={styles.imagePreview}
                                                resizeMode="cover"
                                            />
                                            {index === 0 && (
                                                <View style={styles.thumbnailBadge}>
                                                    <Text style={styles.thumbnailBadgeText}>Main</Text>
                                                </View>
                                            )}
                                            <View style={styles.imageActions}>
                                                <TouchableOpacity
                                                    style={[styles.imageActionButton, styles.thumbnailButton]}
                                                    onPress={() => setAsThumbnail(imageUri)}
                                                >
                                                    <Ionicons name="star" size={16} color="#FFFFFF" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.imageActionButton, styles.deleteButton]}
                                                    onPress={() => removeImage(imageUri)}
                                                >
                                                    <Ionicons name="trash" size={16} color="#FFFFFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>Tips:</Text>
                                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                    • Use high-quality, well-lit images{'\n'}
                                    • Show different angles of the property{'\n'}
                                    • Include both exterior and interior shots{'\n'}
                                    • Add images of nearby amenities{'\n'}
                                    • Tap the star to set a main thumbnail
                                </Text>
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={[styles.footer, isDark && styles.footerDark]}>
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={mode === 'update' ? handleUpdateFiles : onClose}
                        >
                            <Text style={styles.doneButtonText}>
                                {mode === 'update' ? 'Update Files' : 'Done'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#FB902E" />
                        </View>
                    )}
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
        maxHeight: '90%',
    },
    modalContentDark: {
        backgroundColor: '#1F2937',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    modalTitleDark: {
        color: '#F9FAFB',
    },
    content: {
        padding: 20,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 20,
    },
    descriptionDark: {
        color: '#9CA3AF',
    },
    uploadButton: {
        backgroundColor: '#FB902E',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    uploadButtonSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    imageCountContainer: {
        marginBottom: 16,
    },
    imageCount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    imageCountDark: {
        color: '#F9FAFB',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    imageCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    thumbnailBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FB902E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    thumbnailBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    imageActions: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
        gap: 8,
    },
    imageActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailButton: {
        backgroundColor: '#3B82F6',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    infoCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
    },
    infoCardDark: {
        backgroundColor: '#374151',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 8,
    },
    infoTitleDark: {
        color: '#93C5FD',
    },
    infoText: {
        fontSize: 13,
        color: '#1E3A8A',
        lineHeight: 20,
    },
    infoTextDark: {
        color: '#BFDBFE',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerDark: {
        borderTopColor: '#374151',
    },
    doneButton: {
        backgroundColor: '#FB902E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});
