import React from "react";
import MapView, { Marker } from "react-native-maps";
import { View, StyleSheet } from "react-native";

interface MapViewerProps {
    latitude: number;
    longitude: number;
    title?: string;
}

const MapViewer: React.FC<MapViewerProps> = ({ latitude, longitude, title }) => (
    <View style={styles.mapContainer}>
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
    </View>
);

const styles = StyleSheet.create({
    mapContainer: {
        height: 250,
        borderRadius: 10,
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
});

export default MapViewer;
