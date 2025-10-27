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
import { useListingLoader } from '@/utils/market/useListingLoader';
import { useGlobalContext } from '@/context/GlobalProvider';
import useFetchVendorProperties from '@/hooks/market/useVendorListing';
import { useUploadCoordinates } from '@/hooks/market/useUploadCoordinates';

type AddCoordinatesModalProps = {
    visible: boolean;
    listingId?: string | null;
    propertyId?: string | null;
    onClose: () => void;
    mode: 'create' | 'update';
};

type CoordinateMethod = 'latlong' | 'utm' | 'picker';

export default function AddCoordinatesModal({
    visible,
    listingId,
    propertyId,
    onClose,
    mode
}: AddCoordinatesModalProps) {
    const finalId = listingId || propertyId;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const { user } = useGlobalContext();
    const { properties } = useFetchVendorProperties(user?.email || null);

    const { uploadCoordinates, isLoading, error } = useUploadCoordinates();

    const [selectedMethod, setSelectedMethod] = useState<CoordinateMethod>('latlong');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [utmX, setUtmX] = useState('');
    const [utmY, setUtmY] = useState('');
    const [utmZone, setUtmZone] = useState('32');

    const { } = useListingLoader({
        listingId: listingId ?? null,
        properties,
        onListingLoaded: (listing) => {
            if (listing) {
                setLatitude(listing.latitude?.toString() || '');
                setLongitude(listing.longitude?.toString() || '');
            }
        },
    });

    const getCurrentLocation = async () => {
        setGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to get current location');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLatitude(location.coords.latitude.toFixed(6));
            setLongitude(location.coords.longitude.toFixed(6));
            setSelectedMethod('latlong');
            Alert.alert('Success', 'Current location captured successfully!');
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get current location');
        } finally {
            setGettingLocation(false);
        }
    };

    const convertUTMToLatLong = (x: number, y: number, zone: number): { lat: number; lng: number } => {
        const k0 = 0.9996;
        const a = 6378137;
        const e = 0.081819191;
        const e1sq = 0.006739497;

        const arc = y / k0;
        const mu =
            arc /
            (a *
                (1 -
                    Math.pow(e, 2) / 4.0 -
                    (3 * Math.pow(e, 4)) / 64.0 -
                    (5 * Math.pow(e, 6)) / 256.0));

        const ei =
            (1 - Math.pow(1 - e * e, 1 / 2.0)) /
            (1 + Math.pow(1 - e * e, 1 / 2.0));

        const ca = (3 * ei) / 2 - (27 * Math.pow(ei, 3)) / 32.0;
        const cb = (21 * Math.pow(ei, 2)) / 16 - (55 * Math.pow(ei, 4)) / 32;
        const cc = (151 * Math.pow(ei, 3)) / 96;
        const cd = (1097 * Math.pow(ei, 4)) / 512;

        const phi1 =
            mu + ca * Math.sin(2 * mu) + cb * Math.sin(4 * mu) + cc * Math.sin(6 * mu) + cd * Math.sin(8 * mu);

        const n0 = a / Math.pow(1 - Math.pow(e * Math.sin(phi1), 2), 1 / 2.0);
        const r0 = (a * (1 - e * e)) / Math.pow(1 - Math.pow(e * Math.sin(phi1), 2), 3 / 2.0);
        const fact1 = (n0 * Math.tan(phi1)) / r0;

        const _a1 = 500000 - x;
        const dd0 = _a1 / (n0 * k0);
        const fact2 = dd0 * dd0 / 2;

        const t0 = Math.pow(Math.tan(phi1), 2);
        const Q0 = e1sq * Math.pow(Math.cos(phi1), 2);
        const fact3 = ((5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4)) / 24;
        const fact4 =
            ((61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 * e1sq - 3 * Q0 * Q0) * Math.pow(dd0, 6)) / 720;

        const lof1 = _a1 / (n0 * k0);
        const lof2 = ((1 + 2 * t0 + Q0) * Math.pow(dd0, 3)) / 6.0;
        const lof3 =
            ((5 - 2 * Q0 + 28 * t0 - 3 * Math.pow(Q0, 2) + 8 * e1sq + 24 * Math.pow(t0, 2)) *
                Math.pow(dd0, 5)) /
            120;
        const _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1);
        const _a3 = (_a2 * 180) / Math.PI;

        let latitude = (180 * (phi1 - fact1 * (fact2 + fact3 + fact4))) / Math.PI;
        let longitude = ((zone > 0 ? 6 * zone - 183.0 : 3.0) - _a3);

        return { lat: latitude, lng: longitude };
    };

    const handleSubmit = async () => {
        if (!finalId) return;

        let lat: number;
        let lng: number;

        if (selectedMethod === 'utm') {
            if (!utmX.trim() || !utmY.trim() || !utmZone.trim()) {
                Alert.alert('Validation Error', 'Please enter UTM X, Y, and Zone');
                return;
            }

            const x = parseFloat(utmX);
            const y = parseFloat(utmY);
            const zone = parseInt(utmZone);

            if (isNaN(x) || isNaN(y) || isNaN(zone)) {
                Alert.alert('Validation Error', 'Please enter valid UTM coordinates');
                return;
            }

            const converted = convertUTMToLatLong(x, y, zone);
            lat = converted.lat;
            lng = converted.lng;
        } else {
            if (!latitude.trim() || !longitude.trim()) {
                Alert.alert('Validation Error', 'Please enter both latitude and longitude');
                return;
            }

            lat = parseFloat(latitude);
            lng = parseFloat(longitude);

            if (isNaN(lat) || isNaN(lng)) {
                Alert.alert('Validation Error', 'Please enter valid coordinates');
                return;
            }

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                Alert.alert('Validation Error', 'Please enter valid coordinate ranges');
                return;
            }
        }

        setLoading(true);
        try {

            if (mode === 'create') {

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

            } else if (mode === 'update') {

                const response = await uploadCoordinates(lat, lng, finalId);

                if (response.success) {
                    Alert.alert("Success", "Coordinates updated successfully")
                } else {
                    Alert.alert("Error", response.message);
                }
            }
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

    const renderMethodButton = (method: CoordinateMethod, icon: string, title: string) => (
        <TouchableOpacity
            style={[
                styles.methodButton,
                isDark && styles.methodButtonDark,
                selectedMethod === method && styles.methodButtonActive,
                selectedMethod === method && isDark && styles.methodButtonActiveDark,
            ]}
            onPress={() => setSelectedMethod(method)}
        >
            <Ionicons
                name={icon as any}
                size={24}
                color={selectedMethod === method ? '#358B8B' : isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text
                style={[
                    styles.methodButtonText,
                    isDark && styles.methodButtonTextDark,
                    selectedMethod === method && styles.methodButtonTextActive,
                ]}
            >
                {title}
            </Text>
            {selectedMethod === method && (
                <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#358B8B" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Add Property Location</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={isDark ? '#E5E7EB' : '#374151'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                            Choose Input Method
                        </Text>

                        <View style={styles.methodGrid}>
                            {renderMethodButton('latlong', 'navigate-circle-outline', 'Lat/Long')}
                            {renderMethodButton('utm', 'grid-outline', 'UTM')}
                            {renderMethodButton('picker', 'location-outline', 'Use Location')}
                        </View>

                        {selectedMethod === 'picker' && (
                            <View style={[styles.pickerSection, isDark && styles.pickerSectionDark]}>
                                <Ionicons name="information-circle" size={20} color="#358B8B" />
                                <Text style={[styles.pickerText, isDark && styles.pickerTextDark]}>
                                    Tap the button below to use your current location
                                </Text>
                            </View>
                        )}

                        {selectedMethod === 'picker' ? (
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
                                        <Text style={styles.locationButtonText}>Get Current Location</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : selectedMethod === 'latlong' ? (
                            <>
                                <Text style={[styles.label, isDark && styles.labelDark]}>Latitude</Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="e.g. 6.5244"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    value={latitude}
                                    onChangeText={(text) => setLatitude(text.replace(',', '.'))}
                                    keyboardType="decimal-pad"

                                />

                                <Text style={[styles.label, isDark && styles.labelDark]}>Longitude</Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="e.g. 3.3792"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    value={longitude}
                                    onChangeText={(text) => setLongitude(text.replace(',', '.'))}
                                    keyboardType="decimal-pad"
                                />
                            </>
                        ) : (
                            <>
                                <Text style={[styles.label, isDark && styles.labelDark]}>UTM X (Easting mE)</Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="e.g., 500000"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    value={utmX}
                                    onChangeText={setUtmX}
                                    keyboardType="numeric"
                                />

                                <Text style={[styles.label, isDark && styles.labelDark]}>UTM Y (Northing mN)</Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="e.g., 4649776"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    value={utmY}
                                    onChangeText={setUtmY}
                                    keyboardType="numeric"
                                />

                                <Text style={[styles.label, isDark && styles.labelDark]}>UTM Zone</Text>
                                <TextInput
                                    style={[styles.input, isDark && styles.inputDark]}
                                    placeholder="e.g., 32"
                                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                    value={utmZone}
                                    onChangeText={setUtmZone}
                                    keyboardType="numeric"
                                />
                            </>
                        )}

                        {(latitude || utmX) && (
                            <View style={[styles.previewCard, isDark && styles.previewCardDark]}>
                                <View style={styles.previewHeader}>
                                    <Ionicons name="location" size={20} color="#358B8B" />
                                    <Text style={[styles.previewTitle, isDark && styles.previewTitleDark]}>
                                        Current Values
                                    </Text>
                                </View>
                                {selectedMethod === 'utm' && utmX && utmY ? (
                                    <>
                                        <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
                                            UTM X: {utmX}
                                        </Text>
                                        <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
                                            UTM Y: {utmY}
                                        </Text>
                                        <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
                                            Zone: {utmZone}
                                        </Text>
                                    </>
                                ) : latitude && longitude ? (
                                    <>
                                        <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
                                            Latitude: {latitude}
                                        </Text>
                                        <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
                                            Longitude: {longitude}
                                        </Text>
                                    </>
                                ) : null}
                            </View>
                        )}

                        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
                            <Ionicons name="information-circle" size={20} color="#358B8B" />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>Tips:</Text>
                                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                                    {selectedMethod === 'utm'
                                        ? '• UTM coordinates will be converted to Lat/Long\n• Ensure you select the correct UTM zone\n• Zone 32 is default for West Africa'
                                        : selectedMethod === 'picker'
                                            ? '• Make sure location services are enabled\n• This will use your device GPS\n• Works best outdoors with clear sky'
                                            : '• Use Google Maps to find coordinates\n• Latitude ranges from -90 to 90\n• Longitude ranges from -180 to 180\n• Accurate location helps buyers find your property'}
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    methodGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    methodButton: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        minHeight: 100,
    },
    methodButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    methodButtonActive: {
        backgroundColor: '#F0FDFA',
        borderColor: '#358B8B',
    },
    methodButtonActiveDark: {
        backgroundColor: '#134E4A',
        borderColor: '#358B8B',
    },
    methodButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
    },
    methodButtonTextDark: {
        color: '#9CA3AF',
    },
    methodButtonTextActive: {
        color: '#358B8B',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    pickerSection: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    pickerSectionDark: {
        backgroundColor: '#374151',
    },
    pickerText: {
        flex: 1,
        fontSize: 13,
        color: '#358B8B',
        lineHeight: 18,
    },
    pickerTextDark: {
        color: '#93C5FD',
    },
    locationButton: {
        backgroundColor: '#358B8B',
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
    previewCard: {
        backgroundColor: '#F0FDFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#99F6E4',
    },
    previewCardDark: {
        backgroundColor: '#134E4A',
        borderColor: '#2DD4BF',
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F766E',
    },
    previewTitleDark: {
        color: '#5EEAD4',
    },
    previewText: {
        fontSize: 13,
        color: '#0F766E',
        marginTop: 4,
    },
    previewTextDark: {
        color: '#99F6E4',
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
        color: '#358B8B',
        marginBottom: 8,
    },
    infoTitleDark: {
        color: '#93C5FD',
    },
    infoText: {
        fontSize: 13,
        color: '#358B8B',
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
