import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";

export type FeatureData = () => {
    [key: string]: string | boolean | null | undefined;
};

type FeaturesComponentProps = {
    features?: FeatureData[];
    featureIcons?: Record<string, ReactNode>;
    formatKey?: (key: string) => string;
    formatValue?: (key: string, value: any) => string;
};

const defaultFeatureIcons: Record<string, ReactNode> = {
    furnished: <MaterialIcons name="weekend" size={20} color="#2ecc71" />,
    parking_available: <FontAwesome5 name="car" size={20} color="#e74c3c" />,
    swimming_pool: <MaterialIcons name="pool" size={20} color="#3498db" />,
    garden: <MaterialIcons name="nature" size={20} color="#27ae60" />,
    pet_friendly: <Ionicons name="paw-outline" size={20} color="#e67e22" />,
    security: <Ionicons name="shield-checkmark" size={20} color="#3498db" />,
    electricity_proximity: <Ionicons name="flash" size={20} color="#f1c40f" />,
    water_supply: <MaterialIcons name="water" size={20} color="#1abc9c" />,
    road_network: <Ionicons name="navigate" size={20} color="#9b59b6" />,
    development_level: <FontAwesome5 name="city" size={20} color="#2ecc71" />,
    negotiable: <MaterialIcons name="attach-money" size={20} color="#2ecc71" />,
};

const customLabels: Record<string, string> = {
    electricity_proximity: "Electricity Available",
};

const defaultFormatKey = (key: string): string => {
    const customLabel = customLabels[key];
    return customLabel
        ? customLabel
        : key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const ELECTRICITY_PROXIMITY_LABELS: Record<string, string> = {
    nearby: "Less than 100m",
    moderate: "100m - 500m",
    far: "Above 500m",
    available: "Yes",
};

const defaultFormatValue = (key: string, value: any): string => {
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }
    if (key === "electricity_proximity" && ELECTRICITY_PROXIMITY_LABELS[value]) {
        return ELECTRICITY_PROXIMITY_LABELS[value];
    }
    if (value === null || value === undefined) {
        return "N/A";
    }
    if (typeof value === "string") {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return String(value);
};

const FeaturesComponent: React.FC<FeaturesComponentProps> = ({
    features = [],
    featureIcons = defaultFeatureIcons,
    formatKey = defaultFormatKey,
    formatValue = defaultFormatValue,
}) => {
    if (!features || features.length === 0) {
        return <Text style={styles.noFeaturesText}>No features available</Text>;
    }

    const featureData = features[0];

    const filteredKeys = Object.keys(featureData).filter(
        (key) => key !== "additional_features" && key !== "verified_user"
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
        >
            {filteredKeys.map((key) => (
                <View key={key} style={styles.featureItem}>
                    <View style={styles.iconWrapper}>{featureIcons[key]}</View>
                    <Text style={styles.key}>{formatKey(key)}</Text>
                    <Text style={styles.value}>
                        {formatValue(key, featureData[key as keyof FeatureData])}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 10,
    },
    featureItem: {
        alignItems: "center",
        marginHorizontal: 10,
        padding: 10,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconWrapper: {
        marginBottom: 5,
    },
    key: {
        fontSize: 12,
        color: "#555",
    },
    value: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    noFeaturesText: {
        textAlign: "center",
        fontSize: 16,
        color: "#777",
    },
});

export default FeaturesComponent;
