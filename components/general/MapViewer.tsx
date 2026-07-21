import React, { useState } from "react";
import MapView, { Marker, MapType } from "react-native-maps";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapErrorBoundary from "./MapErrorBoundary";

interface MapViewerProps {
    latitude: number;
    longitude: number;
    title?: string;
}

const MapViewer: React.FC<MapViewerProps> = ({ latitude, longitude, title }) => {
    const [mapError, setMapError] = useState(false);
    const [mapType, setMapType] = useState<MapType>("standard");

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
                    mapType={mapType}
                    initialRegion={{
                        latitude,
                        longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker coordinate={{ latitude, longitude }} title={title} />
                </MapView>
                <TouchableOpacity
                    style={styles.mapTypeButton}
                    onPress={() =>
                        setMapType((prev) =>
                            prev === "standard" ? "satellite" : "standard"
                        )
                    }
                >
                    <Ionicons
                        name={mapType === "standard" ? "globe-outline" : "map-outline"}
                        size={18}
                        color="#348b8b"
                    />
                </TouchableOpacity>
            </MapErrorBoundary>
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        height: 280,
        borderRadius: 12,
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
    mapTypeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "white",
        borderRadius: 8,
        padding: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
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
