import React, { useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import MapErrorBoundary from "./MapErrorBoundary";

interface MapViewerProps {
    latitude: number;
    longitude: number;
    title?: string;
}

const MapViewer: React.FC<MapViewerProps> = ({ latitude, longitude, title }) => {
    const [mapError, setMapError] = useState(false);

    const fallback = (
        <View style={[styles.mapContainer, styles.fallback]}>
            <Text style={styles.fallbackText}>Map unavailable</Text>
        </View>
    );

    if (mapError) {
        return fallback;
    }

    return (
        <View style={styles.mapContainer}>
            <MapErrorBoundary fallback={fallback} onError={() => setMapError(true)}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude,
                        longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker coordinate={{ latitude, longitude }} title={title} />
                </MapView>
            </MapErrorBoundary>
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        height: 250,
        borderRadius: 10,
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
    fallback: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0fafa",
    },
    fallbackText: {
        color: "#348b8b",
        fontSize: 13,
    },
});

export default MapViewer;
