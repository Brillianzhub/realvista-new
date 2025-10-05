import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Text,
} from 'react-native';
import MapView, { Marker, MapType } from 'react-native-maps';
// import { WebView } from 'react-native-webview';

interface MapViewerProps {
    latitude?: number | null;
    longitude?: number | null;
    title?: string;
    description?: string;
    virtual_tour_url?: string;
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

const MapViewer: React.FC<MapViewerProps> = ({
    latitude,
    longitude,
    title,
    description,
    virtual_tour_url,
}) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [mapType, setMapType] = useState<MapType>('hybrid');
    // const [showVirtualTour, setShowVirtualTour] = useState<boolean>(false);

    const extractCoordinatesFromUrl = (url: string): Coordinates | null => {
        const regex = /(?:q=)([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/;
        const match = url.match(regex);
        if (match) {
            return {
                latitude: parseFloat(match[1]),
                longitude: parseFloat(match[2]),
            };
        }
        return null;
    };

    let lat = latitude;
    let lng = longitude;

    if (!lat || !lng) {
        if (virtual_tour_url) {
            const coordinates = extractCoordinatesFromUrl(virtual_tour_url);
            if (coordinates) {
                lat = coordinates.latitude;
                lng = coordinates.longitude;
            }
        }
        if (!lat || !lng) {
            return null;
        }
    }

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const toggleMapType = () => {
        const nextMapType: MapType =
            mapType === 'standard'
                ? 'satellite'
                : mapType === 'satellite'
                    ? 'hybrid'
                    : 'standard';
        setMapType(nextMapType);
    };

    // const toggleVirtualTour = () => setShowVirtualTour(!showVirtualTour);

    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                mapType={mapType}
                initialRegion={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker coordinate={{ latitude: lat, longitude: lng }} title={title} description={description} />
            </MapView>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={toggleFullscreen}>
                    <Text style={styles.buttonText}>View Fullscreen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={toggleMapType}>
                    <Text style={styles.buttonText}>Toggle Map</Text>
                </TouchableOpacity>
            </View>

            {/* Fullscreen Modal */}
            <Modal
                visible={isFullscreen}
                animationType="slide"
                onRequestClose={toggleFullscreen}
                transparent={false}
            >
                <View style={styles.modalContainer}>
                    <MapView
                        style={styles.fullscreenMap}
                        mapType={mapType}
                        initialRegion={{
                            latitude: lat,
                            longitude: lng,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker coordinate={{ latitude: lat, longitude: lng }} title={title} description={description} />
                    </MapView>

                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleFullscreen}>
                            <Text style={styles.buttonText}>Close Fullscreen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={toggleMapType}>
                            <Text style={styles.buttonText}>Toggle Map</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Virtual Tour (if needed later) */}
            {/* <Modal
        visible={showVirtualTour}
        animationType="slide"
        onRequestClose={toggleVirtualTour}
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <WebView
            source={{ uri: buildStreetViewUrl(latitude, longitude) }}
            style={styles.fullscreenMap}
          />
          <TouchableOpacity style={styles.button} onPress={toggleVirtualTour}>
            <Text style={styles.buttonText}>Close Virtual Tour</Text>
          </TouchableOpacity>
        </View>
      </Modal> */}
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        height: 300,
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 16,
    },
    map: {
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        right: 8,
        padding: 10,
        borderRadius: 8,
        gap: 10,
    },
    modalContainer: {
        flex: 1,
    },
    fullscreenMap: {
        ...StyleSheet.absoluteFillObject,
    },
    modalButtonsContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        padding: 4,
        gap: 10,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#FB902E',
        borderRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default MapViewer;
