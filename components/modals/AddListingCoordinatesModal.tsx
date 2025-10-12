import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { type MarketplaceListing } from '@/data/marketplaceListings';

type AddCoordinatesModalProps = {
    visible: boolean;
    listingId?: string | null;
    propertyId?: string | null;
    onClose: () => void;
};

export default function AddListingCoordinatesModal({
    visible,
    listingId,
    propertyId,
    onClose,
}: AddCoordinatesModalProps) {
    const finalId = listingId || propertyId;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    useEffect(() => {
        if (visible && finalId) {
            loadCoordinates();
        }
    }, [visible, finalId]);

    const loadCoordinates = async () => {
        if (!finalId) return;

        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (storedListings) {
                const listings: MarketplaceListing[] = JSON.parse(storedListings);
                const listing = listings.find((l) => l.id === finalId);

                if (listing) {
                    setLatitude(listing.latitude?.toString() || '');
                    setLongitude(listing.longitude?.toString() || '');
                }
            }
        } catch (error) {
            console.error('Error loading coordinates:', error);
        }
    };

    const getCurrentLocation = async () => {
        setGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to get current location');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLatitude(location.coords.latitude.toString());
            setLongitude(location.coords.longitude.toString());
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get current location');
        } finally {
            setGettingLocation(false);
        }
    };

    const handleSubmit = async () => {
        if (!finalId) return;

        if (!latitude.trim() || !longitude.trim()) {
            Alert.alert('Validation Error', 'Please enter both latitude and longitude');
            return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            Alert.alert('Validation Error', 'Please enter valid coordinates');
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            Alert.alert('Validation Error', 'Please enter valid coordinate ranges');
            return;
        }

        setLoading(true);
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            if (!storedListings) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            const listings: MarketplaceListing[] = JSON.parse(storedListings);
            const index = listings.findIndex((l) => l.id === finalId);

            if (index === -1) {
                Alert.alert('Error', 'Listing not found');
                return;
            }

            listings[index] = {
                ...listings[index],
                latitude: lat,
                longitude: lng,
                current_step: Math.max(listings[index].current_step, 3),
                completion_percentage: calculateCompletion(listings[index]),
                updated_at: new Date().toISOString(),
            };

            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));

            Alert.alert('Success', 'Coordinates saved successfully');
            onClose();
        } catch (error: any) {
            console.error('Error saving coordinates:', error);
            Alert.alert('Error', error.message || 'Failed to save coordinates');
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = (listing: MarketplaceListing) => {
        let completion = 0;

        if (listing.property_name) completion += 15;
        if (listing.images && listing.images.length > 0) completion += 25;
        completion += 20;
        if (listing.features) completion += 20;

        return Math.min(completion, 100);
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
                            Add Property Location
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={28}
                                color={isDark ? '#E5E7EB' : '#374151'}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Enter the GPS coordinates of your property or use your current location.
                        </Text>

                        <TouchableOpacity
                            style={styles.locationButton}
                            onPress={getCurrentLocation}
                            disabled={gettingLocation}
                        >
                            {gettingLocation ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="navigate" size={24} color="#FFFFFF" />
                                    <Text style={styles.locationButtonText}>Use Current Location</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.label, isDark && styles.labelDark]}>Latitude</Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="e.g., 6.5244"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={latitude}
                            onChangeText={setLatitude}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.label, isDark && styles.labelDark]}>Longitude</Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="e.g., 3.3792"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={longitude}
                            onChangeText={setLongitude}
                            keyboardType="numeric"
                        />

                        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>Tips:</Text>
                                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                    • Use Google Maps to find coordinates{'\n'}
                                    • Latitude ranges from -90 to 90{'\n'}
                                    • Longitude ranges from -180 to 180{'\n'}
                                    • Accurate location helps buyers find your property
                                </Text>
                            </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={[styles.footer, isDark && styles.footerDark]}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Save Location</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
        fontSize: 20,
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
    locationButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    locationButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        marginBottom: 16,
    },
    inputDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        color: '#F9FAFB',
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
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerDark: {
        borderTopColor: '#374151',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    submitButton: {
        backgroundColor: '#FB902E',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
