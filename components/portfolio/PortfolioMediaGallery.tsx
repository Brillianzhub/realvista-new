// components/SimplePropertyMediaGallery.tsx
import React, { JSX, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Modal,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface MediaFile {
    id: number;
    file: string;
    file_type: 'image' | 'video';
    name: string;
}

interface PropertyMediaGalleryProps {
    mediaFiles?: MediaFile[];
    propertyTitle?: string;
}

const PortfolioMediaGallery: React.FC<PropertyMediaGalleryProps> = ({ 
    mediaFiles = [], 
    propertyTitle = '' 
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const images = mediaFiles.filter(file => file.file_type === 'image');
    const videos = mediaFiles.filter(file => file.file_type === 'video');
    const allMedia = [...images, ...videos];

    if (allMedia.length === 0) {
        return (
            <View style={styles.noMediaContainer}>
                <Ionicons name="images-outline" size={48} color="#CBD5E1" />
                <Text style={styles.noMediaText}>No media available</Text>
            </View>
        );
    }

    const handleMediaPress = (index: number): void => {
        setSelectedIndex(index);
        setModalVisible(true);
    };

    const handleCloseModal = (): void => {
        setModalVisible(false);
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setSelectedIndex(newIndex);
    };

    const openVideoInBrowser = (url: string): void => {
        Linking.openURL(url).catch(err => 
            console.error('Failed to open URL:', err)
        );
    };

    const renderMediaModal = (): JSX.Element | null => {
        if (allMedia.length === 0) return null;
        
        return (
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        onPress={handleCloseModal} 
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <ScrollView 
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleScrollEnd}
                        style={styles.mediaScrollView}
                        contentOffset={{ x: screenWidth * selectedIndex, y: 0 }}
                    >
                        {allMedia.map((item, index) => (
                            <View key={item.id} style={styles.mediaItemContainer}>
                                {item.file_type === 'image' ? (
                                    <Image
                                        source={{ uri: item.file }}
                                        style={styles.fullSizeMedia}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <TouchableOpacity 
                                        style={styles.videoContainer}
                                        onPress={() => openVideoInBrowser(item.file)}
                                    >
                                        <View style={styles.videoPlaceholder}>
                                            <Ionicons name="play-circle-outline" size={64} color="#FFF" />
                                            <Text style={styles.videoPlaceholderText}>
                                                Tap to play video
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.pagination}>
                        <Text style={styles.paginationText}>
                            {selectedIndex + 1} / {allMedia.length}
                        </Text>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Property Media</Text>
                <View style={styles.mediaStats}>
                    {images.length > 0 && (
                        <View style={styles.statBadge}>
                            <Ionicons name="image" size={16} color="#358B8B" />
                            <Text style={styles.statText}>{images.length}</Text>
                        </View>
                    )}
                    {videos.length > 0 && (
                        <View style={styles.statBadge}>
                            <Ionicons name="videocam" size={16} color="#EF4444" />
                            <Text style={styles.statText}>{videos.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScrollContainer}
            >
                {allMedia.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.thumbnailContainer}
                        onPress={() => handleMediaPress(index)}
                        activeOpacity={0.8}
                    >
                        {item.file_type === 'image' ? (
                            <Image
                                source={{ uri: item.file }}
                                style={styles.thumbnailImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.videoThumbnail}>
                                <Ionicons name="play-circle" size={32} color="white" />
                            </View>
                        )}
                        {item.file_type === 'video' && (
                            <View style={styles.videoBadge}>
                                <Ionicons name="videocam" size={12} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {renderMediaModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    mediaStats: {
        flexDirection: 'row',
        gap: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
    },
    thumbnailScrollContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    thumbnailContainer: {
        width: 120,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F3F4F6',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 4,
    },
    noMediaContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginHorizontal: 16,
    },
    noMediaText: {
        marginTop: 12,
        color: '#9CA3AF',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    mediaScrollView: {
        flex: 1,
    },
    mediaItemContainer: {
        width: screenWidth,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSizeMedia: {
        width: screenWidth,
        height: '100%',
    },
    videoContainer: {
        width: screenWidth,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    videoPlaceholder: {
        alignItems: 'center',
    },
    videoPlaceholderText: {
        marginTop: 16,
        fontSize: 18,
        color: '#FFF',
        fontWeight: '600',
    },
    pagination: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    paginationText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PortfolioMediaGallery;