// components/PortfolioMediaGallery.tsx
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
  Linking,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MediaFile {
  id: number;
  file: string;
  file_type: 'image' | 'video';
  name: string;
}

interface PortfolioMediaGalleryProps {
  mediaFiles?: MediaFile[];
  propertyTitle?: string;
  propertyId?: number;
  onFileDeleted?: (deletedFileId: number) => void;
  onRefetchNeeded?: () => Promise<void>;
  editable?: boolean;
}

const PortfolioMediaGallery: React.FC<PortfolioMediaGalleryProps> = ({
  mediaFiles = [],
  propertyTitle = '',
  propertyId,
  onFileDeleted,
  onRefetchNeeded,
  editable = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);

  const images = mediaFiles.filter((file) => file.file_type === 'image');
  const videos = mediaFiles.filter((file) => file.file_type === 'video');
  const allMedia = [...images, ...videos];

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const handleDeleteFile = async (
    fileId: number,
    fileType: 'image' | 'video',
  ): Promise<void> => {
    // Show confirmation dialog
    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete this ${fileType}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteFile(fileId, fileType),
        },
      ],
    );
  };

  const refetchData = async (): Promise<void> => {
    if (!onRefetchNeeded) return;

    try {
      setIsRefetching(true);
      await onRefetchNeeded();
    } catch (error) {
      console.error('Error refetching data:', error);
    } finally {
      setIsRefetching(false);
    }
  };

  const confirmDeleteFile = async (
    fileId: number,
    fileType: 'image' | 'video',
  ): Promise<void> => {
    setIsDeleting(true);
    setDeletingFileId(fileId);

    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(
        `https://www.realvistamanagement.com/portfolio/delete-file/${fileId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        // Successfully deleted
        Alert.alert(
          'Success',
          `${fileType === 'image' ? 'Image' : 'Video'} deleted successfully`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Callback to parent component with file ID
                if (onFileDeleted) {
                  onFileDeleted(fileId);
                }

                // Refetch data from main page
                await refetchData();

                // If we're in the modal viewing the deleted file, close it
                const currentMedia = allMedia[selectedIndex];
                if (currentMedia?.id === fileId) {
                  setModalVisible(false);
                }
              },
            },
          ],
        );
      } else if (response.status === 403) {
        Alert.alert(
          'Permission Denied',
          'You do not have permission to delete this file.',
        );
      } else if (response.status === 404) {
        Alert.alert(
          'Not Found',
          'The file you are trying to delete does not exist.',
        );
      } else {
        const errorData = await response.text();
        throw new Error(
          `Failed to delete file: ${response.status} ${errorData}`,
        );
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingFileId(null);
    }
  };

  const canDeleteFile = (): boolean => {
    return editable && propertyId !== undefined;
  };

  if (allMedia.length === 0) {
    return (
      <View
        style={[
          styles.noMediaContainer,
          { backgroundColor: colors.background.secondary },
        ]}
      >
        <Ionicons name="images-outline" size={48} color="#CBD5E1" />
        <Text style={styles.noMediaText}>No media available</Text>
        {editable && (
          <Text style={styles.addMediaHint}>
            Tap Update Property button to add media
          </Text>
        )}
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

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth,
    );
    setSelectedIndex(newIndex);
  };

  const openVideoInBrowser = (url: string): void => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err),
    );
  };

  const renderMediaModal = (): JSX.Element | null => {
    if (allMedia.length === 0) return null;

    const currentMedia = allMedia[selectedIndex];
    const isDeletingCurrent = deletingFileId === currentMedia?.id;

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <View style={styles.safeArea}>
          <StatusBar
            backgroundColor="rgba(0,0,0,0.95)"
            barStyle="light-content"
          />
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalHeader,
                {
                  paddingTop: insets.top + 12, // 👈 key fix
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
                disabled={isDeletingCurrent}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text style={styles.closeButtonText}>Back</Text>
              </TouchableOpacity>

              {canDeleteFile() && currentMedia && (
                <TouchableOpacity
                  onPress={() =>
                    handleDeleteFile(currentMedia.id, currentMedia.file_type)
                  }
                  style={styles.deleteButton}
                  disabled={isDeletingCurrent}
                >
                  {isDeletingCurrent ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

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
                      disabled={isDeleting}
                    >
                      <View style={styles.videoPlaceholder}>
                        <Ionicons
                          name="play-circle-outline"
                          size={64}
                          color="#FFF"
                        />
                        <Text style={styles.videoPlaceholderText}>
                          Tap to play video
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {isDeleting && deletingFileId === item.id && (
                    <View style={styles.deletingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                      <Text style={styles.deletingText}>Deleting...</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.paginationContainer}>
              <View style={styles.pagination}>
                <Text style={styles.paginationText}>
                  {selectedIndex + 1} / {allMedia.length}
                </Text>
              </View>

              {propertyTitle && (
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText} numberOfLines={1}>
                    {propertyTitle}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Property Media</Text>
        <View style={styles.headerRight}>
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
          {editable && (
            <View style={styles.editableContainer}>
              <Text style={styles.editableBadge}>Editable</Text>
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
          <View key={item.id} style={styles.thumbnailWrapper}>
            <TouchableOpacity
              style={styles.thumbnailContainer}
              onPress={() => handleMediaPress(index)}
              activeOpacity={0.8}
              disabled={isDeleting && deletingFileId === item.id}
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

              {isDeleting && deletingFileId === item.id && (
                <View style={styles.thumbnailDeletingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {editable && (
              <TouchableOpacity
                style={styles.thumbnailDeleteButton}
                onPress={() => handleDeleteFile(item.id, item.file_type)}
                disabled={isDeleting}
              >
                {isDeleting && deletingFileId === item.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            )}
          </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  editableContainer: {
    marginLeft: 'auto',
  },
  editableBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#358B8B',
    backgroundColor: '#F0F9F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  thumbnailScrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  thumbnailWrapper: {
    position: 'relative',
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
  thumbnailDeleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnailDeletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMediaContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
  },
  noMediaText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  addMediaHint: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    minWidth: 100,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  mediaScrollView: {
    flex: 1,
  },
  mediaItemContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletingText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pagination: {
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
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: screenWidth * 0.6,
  },
  titleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PortfolioMediaGallery;
