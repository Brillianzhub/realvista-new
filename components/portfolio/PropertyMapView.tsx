// components/PropertyMapView.tsx
import React, { useState, useRef, JSX, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Platform,
    Alert,
    ActivityIndicator,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Coordinates {
    id: number;
    latitude: number;
    longitude: number;
}

interface PropertyMapViewProps {
    coordinates?: Coordinates[];
    propertyTitle?: string;
    city?: string;
    location?: string;
    address?: string;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
    coordinates = [],
    propertyTitle = '',
    city = '',
    location = '',
    address = ''
}) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const mapRef = useRef<MapView>(null);

    if (!coordinates || coordinates.length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.noLocationContainer}>
                    <Ionicons name="location-outline" size={48} color="#CBD5E1" />
                    <Text style={styles.noLocationText}>No location data available</Text>
                </View>
            </View>
        );
    }

    const mainCoordinate = coordinates[0];
    const fullAddress = `${address || ''}${city ? `, ${city}` : ''}${location && location !== city ? `, ${location}` : ''}`.trim();

    const initialRegion: Region = {
        latitude: mainCoordinate.latitude,
        longitude: mainCoordinate.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const handleExpandMap = (): void => {
        setModalVisible(true);
    };

    const handleCloseModal = (): void => {
        setModalVisible(false);
    };

    const handleMapReady = (): void => {
        setIsLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Error', 'Map took too long to load. Please check your internet.');
        }, 8000); // 8 seconds timeout

        return () => clearTimeout(timeout);
    }, []);


    const zoomToMarker = (): void => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                ...initialRegion,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    const openInMapsApp = (): void => {
        const url = Platform.select({
            ios: `maps:?q=${mainCoordinate.latitude},${mainCoordinate.longitude}`,
            android: `geo:${mainCoordinate.latitude},${mainCoordinate.longitude}?q=${mainCoordinate.latitude},${mainCoordinate.longitude}(${propertyTitle})`,
        });
        
        if (url) {
            Linking.openURL(url).catch(err => 
                console.error('Failed to open maps:', err)
            );
        }
    };

    const getDirections = (): void => {
        const url = Platform.select({
            ios: `http://maps.apple.com/?daddr=${mainCoordinate.latitude},${mainCoordinate.longitude}`,
            android: `https://www.google.com/maps/dir/?api=1&destination=${mainCoordinate.latitude},${mainCoordinate.longitude}`,
        });
        
        if (url) {
            Linking.openURL(url).catch(err => 
                console.error('Failed to get directions:', err)
            );
        }
    };

    const renderMapModal = (): JSX.Element => {
        return (
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderLeft}>
                            <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                                <Ionicons name="arrow-back" size={24} color="#111827" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.modalTitle} numberOfLines={1}>{propertyTitle}</Text>
                                <Text style={styles.modalSubtitle} numberOfLines={2}>{fullAddress}</Text>
                            </View>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={zoomToMarker} style={styles.modalActionButton}>
                                <Ionicons name="locate" size={20} color="#358B8B" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={getDirections} style={styles.modalActionButton}>
                                <Ionicons name="navigate" size={20} color="#358B8B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.fullScreenMapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.fullScreenMap}
                            initialRegion={initialRegion}
                            onMapReady={handleMapReady}
                            
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            showsCompass={true}
                            showsScale={true}
                            zoomEnabled={true}
                            scrollEnabled={true}
                            rotateEnabled={true}
                            pitchEnabled={true}
                        >
                            <Marker
                                coordinate={{
                                    latitude: mainCoordinate.latitude,
                                    longitude: mainCoordinate.longitude,
                                }}
                                title={propertyTitle}
                                description={fullAddress}
                                pinColor="#358B8B"
                            >
                                <View style={styles.customMarker}>
                                    <View style={styles.markerDot} />
                                    <View style={styles.markerPulse} />
                                </View>
                            </Marker>
                        </MapView>

                        {isLoading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#358B8B" />
                                <Text style={styles.loadingText}>Loading map...</Text>
                            </View>
                        )}

                        <View style={styles.mapControls}>
                            <TouchableOpacity 
                                onPress={zoomToMarker} 
                                style={styles.mapControlButton}
                            >
                                <Ionicons name="locate" size={20} color="#111827" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={getDirections} 
                                style={[styles.mapControlButton, styles.directionsButton]}
                            >
                                <Ionicons name="navigate" size={18} color="#FFFFFF" />
                                <Text style={styles.directionsText}>Directions</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Location</Text>
                <TouchableOpacity onPress={handleExpandMap} style={styles.expandButton}>
                    <Ionicons name="expand-outline" size={20} color="#358B8B" />
                    <Text style={styles.expandText}>Expand</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    onPress={handleExpandMap}
                >
                    <Marker
                        coordinate={{
                            latitude: mainCoordinate.latitude,
                            longitude: mainCoordinate.longitude,
                        }}
                        title={propertyTitle}
                        description={fullAddress}
                        pinColor="#358B8B"
                    />
                </MapView>

                <TouchableOpacity 
                    style={styles.overlayButton} 
                    onPress={handleExpandMap}
                    activeOpacity={0.8}
                >
                    <View style={styles.overlayContent}>
                        <Ionicons name="expand" size={24} color="white" />
                        <Text style={styles.overlayText}>Tap to expand map</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.addressContainer}>
                    <View style={styles.addressIcon}>
                        <Ionicons name="location" size={16} color="#358B8B" />
                    </View>
                    <View style={styles.addressTextContainer}>
                        <Text style={styles.addressTitle} numberOfLines={1}>
                            {propertyTitle}
                        </Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                            {fullAddress}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={openInMapsApp} style={styles.navigationButton}>
                        <Ionicons name="navigate-outline" size={20} color="#358B8B" />
                    </TouchableOpacity>
                </View>
            </View>

            {renderMapModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginVertical: 16,
    },
    sectionHeader: {
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
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F0F9F9',
        borderRadius: 8,
    },
    expandText: {
        fontSize: 14,
        color: '#358B8B',
        fontWeight: '500',
    },
    noLocationContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginHorizontal: 16,
    },
    noLocationText: {
        marginTop: 12,
        color: '#9CA3AF',
        fontSize: 14,
    },
    mapContainer: {
        position: 'relative',
        height: 200,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    overlayButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContent: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    overlayText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    addressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    addressIcon: {
        marginRight: 8,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 12,
        color: '#6B7280',
    },
    navigationButton: {
        padding: 8,
        backgroundColor: '#F0F9F9',
        borderRadius: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    modalCloseButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
        flex: 1,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalActionButton: {
        padding: 8,
        backgroundColor: '#F0F9F9',
        borderRadius: 8,
    },
    fullScreenMapContainer: {
        flex: 1,
        position: 'relative',
    },
    fullScreenMap: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#4B5563',
        fontSize: 14,
    },
    mapControls: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        gap: 12,
    },
    mapControlButton: {
        backgroundColor: '#FFFFFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    directionsButton: {
        backgroundColor: '#358B8B',
        flexDirection: 'row',
        paddingHorizontal: 16,
        width: 'auto',
        gap: 6,
    },
    directionsText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#358B8B',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(53, 139, 139, 0.3)',
        zIndex: -1,
    },
});

export default PropertyMapView;