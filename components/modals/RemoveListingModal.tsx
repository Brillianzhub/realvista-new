import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    useColorScheme,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type MarketplaceListing } from '@/data/marketplaceListings';
import { isBackendListing, getBackendId } from '@/utils/market/marketplaceMapper';

type RemoveListingModalProps = {
    visible: boolean;
    listingId: string | null;
    onClose: () => void;
};

export default function RemoveListingModal({
    visible,
    listingId,
    onClose,
}: RemoveListingModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [listing, setListing] = useState<MarketplaceListing | null>(null);
    const [confirmationText, setConfirmationText] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible && listingId) {
            loadListing();
        }
    }, [visible, listingId]);

    const loadListing = async () => {
        if (!listingId) return;

        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (storedListings) {
                const listings: MarketplaceListing[] = JSON.parse(storedListings);
                const foundListing = listings.find((l) => l.id === listingId);
                setListing(foundListing || null);
            }
        } catch (error) {
            console.error('Error loading listing:', error);
        }
    };

    const handleRemoveDraftListing = async () => {
        if (!listingId) return;

        try {
            setIsLoading(true);

            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (!storedListings) {
                Alert.alert('Error', 'No listings found');
                return;
            }

            const listings: MarketplaceListing[] = JSON.parse(storedListings);

            // Filter out the listing with the given ID
            const updatedListings = listings.filter((l) => l.id !== listingId);

            // If the array length didn’t change, the listing wasn’t found
            if (updatedListings.length === listings.length) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            // Save the updated list back
            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(updatedListings));

            Alert.alert('Success', 'Listing has been removed successfully.', [
                {
                    text: 'OK',
                    onPress: () => {
                        setConfirmationText('');
                        setReason('');
                        onClose();
                    },
                },
            ]);
        } catch (error) {
            console.error('Error removing listing:', error);
            Alert.alert('Error', 'Failed to remove listing');
        } finally {
            setIsLoading(false);
        }
    };


    const handleRemoveBackendListing = async () => {
        if (!listingId) return;

        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('authToken')
            if (!token) { return }

            const response = await fetch(`https://www.realvistamanagement.com/market/delete-property/${listingId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Property deleted successfully');
            } else {
                Alert.alert('Error', data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            Alert.alert('Error', 'An error occurred while deleting the property');
        } finally {
            setIsLoading(false);
        };
    };

    const handleSubmit = () => {
        if (!listing) return;

        if (confirmationText.toLowerCase() === 'remove') {
            if (isBackendListing(listing)) {
                handleRemoveBackendListing();
            } else {
                handleRemoveDraftListing();
            }
        }
    };

    const isValid = confirmationText.toLowerCase() === 'remove' && listingId;
    const isPublished = listing?.status === 'Published';
    const isBackend = listing ? isBackendListing(listing) : false;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                Remove Listing
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons
                                    name="close"
                                    size={28}
                                    color={isDark ? '#E5E7EB' : '#374151'}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.warningBox}>
                                <Ionicons name="warning" size={32} color="#F59E0B" />
                                <Text style={styles.warningText}>
                                    {isBackend
                                        ? 'This is a published listing from your backend. It cannot be removed from this app.'
                                        : isPublished
                                            ? 'This listing is published. Removing it will mark it as removed but not delete it permanently.'
                                            : 'This action will mark the listing as removed. You can restore it later if needed.'}
                                </Text>
                            </View>

                            {listing && (
                                <View style={[styles.listingInfo, isDark && styles.listingInfoDark]}>
                                    <Text style={[styles.listingName, isDark && styles.listingNameDark]}>
                                        {listing.property_name || 'Untitled Listing'}
                                    </Text>
                                    <Text style={[styles.listingDetails, isDark && styles.listingDetailsDark]}>
                                        {listing.property_type} • {listing.location}
                                    </Text>
                                    <View style={styles.statusBadgeContainer}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor:
                                                        listing.status === 'Published'
                                                            ? '#10B981'
                                                            : listing.status === 'Draft'
                                                                ? '#F59E0B'
                                                                : '#EF4444',
                                                },
                                            ]}
                                        >
                                            <Text style={styles.statusBadgeText}>{listing.status}</Text>
                                        </View>
                                        {isBackend && (
                                            <View style={[styles.statusBadge, { backgroundColor: '#3B82F6' }]}>
                                                <Text style={styles.statusBadgeText}>Backend</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {!isBackend && (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>
                                            Reason for Removal
                                        </Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                                            placeholder="Optional: Why are you removing this listing?"
                                            placeholderTextColor="#9CA3AF"
                                            value={reason}
                                            onChangeText={setReason}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={[styles.label, isDark && styles.labelDark]}>
                                            Type "REMOVE" to confirm <Text style={styles.required}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[styles.input, isDark && styles.inputDark]}
                                            placeholder="REMOVE"
                                            placeholderTextColor="#9CA3AF"
                                            value={confirmationText}
                                            onChangeText={setConfirmationText}
                                            autoCapitalize="characters"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.submitButton,
                                            (!isValid || isLoading) && styles.submitButtonDisabled,
                                        ]}
                                        onPress={handleSubmit}
                                        disabled={!isValid || isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <>
                                                <Ionicons
                                                    name="trash"
                                                    size={20}
                                                    color={isValid ? '#FFFFFF' : '#9CA3AF'}
                                                />
                                                <Text
                                                    style={[
                                                        styles.submitButtonText,
                                                        !isValid && styles.submitButtonTextDisabled,
                                                    ]}
                                                >
                                                    Remove Listing
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}

                            {isBackend && (
                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: '#6B7280' }]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.submitButtonText}>Close</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
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
    warningBox: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#92400E',
        fontWeight: '500',
        lineHeight: 20,
    },
    listingInfo: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    listingInfoDark: {
        backgroundColor: '#374151',
    },
    listingName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    listingNameDark: {
        color: '#F9FAFB',
    },
    listingDetails: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    listingDetailsDark: {
        color: '#9CA3AF',
    },
    statusBadgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
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
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    inputDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        color: '#F9FAFB',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonTextDisabled: {
        color: '#9CA3AF',
    },
    required: {
        color: '#EF4444',
    },
});
