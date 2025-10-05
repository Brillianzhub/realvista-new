import images from "@/constants/images";
import React from "react";
import {
    FlatList,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Share,
    ShareContent,
    ListRenderItem,
} from "react-native";
import { router } from "expo-router";
import ImageCarousel from "./ImageCarousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Linking from "expo-linking";

// Define the shape of a property
export interface Property {
    id: number;
    title: string;
    description: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    property_type: string;
    listing_purpose: string;
    bedrooms?: number;
    listed_date?: string;
    image_files?: Array<{ file?: string; image_url?: string }>;
}

// Props for the component
interface MarketPropertyListProps {
    properties: Property[];
    formatCurrency: (amount: number, currency: string) => string;
}

const MarketPropertyList: React.FC<MarketPropertyListProps> = ({
    properties,
    formatCurrency,
}) => {
    const handleViewProperty = async (propertyId: number) => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                throw new Error("Authentication token is missing");
            }

            await axios.get(
                `https://www.realvistamanagement.com/market/view-property/${propertyId}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
        } catch (error: any) {
            console.error(
                "Error viewing property:",
                error.response?.data || error.message
            );
        }
    };

    const handleShareProperty = (property: Property) => {
        const deepLink = Linking.createURL("/MarketListingDetails", {
            queryParams: { selectedItemId: property.id.toString() },
        });

        const shareOptions: ShareContent = {
            message: `Check out this property: ${property.title}\n\n${property.description}\n\nPrice: ${formatCurrency(
                property.price,
                property.currency
            )}\nLocation: ${property.city}, ${property.state}\n\nView more details: ${deepLink}`,
            title: "Share Property",
            url: deepLink,
        };

        Share.share(shareOptions).catch((error) => {
            console.error("Error sharing property:", error);
        });
    };

    const renderProperty: ListRenderItem<Property> = ({ item }) => {
        const validImages = Array.isArray(item.image_files)
            ? item.image_files
                .map(img => ({ file: img.file ?? img.image_url })) 
                .filter((img): img is { file: string } => !!img.file) 
            : [];

        return (
            <View style={styles.propertyCard}>
                <ImageCarousel images={validImages} listed_date={item.listed_date} />

                <TouchableOpacity
                    onPress={async () => {
                        await handleViewProperty(item.id);
                        router.push({
                            pathname: "/(app)/(tabs)/market/marketdetails",

                            // pathname: "/(marketdetail)/MarketListingDetails",
                            params: { selectedItemId: JSON.stringify(item.id) },
                        });
                    }}
                >
                    <View style={styles.propertyInfo}>
                        <Text style={[styles.propertyTitle, { color: "#358B8B" }]}>
                            {item.title}
                        </Text>

                        <Text
                            style={[
                                styles.propertyType,
                                { color: "#FB902E", fontWeight: "bold" },
                            ]}
                        >
                            {item?.bedrooms ? `${item?.bedrooms} Bedrooms ` : ""}
                            {item?.property_type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                            for{" "}
                            {item?.listing_purpose
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </Text>

                        <Text
                            style={[styles.propertyDescription]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {item.description}
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                                marginTop: 5,
                            }}
                        >
                            <Image source={images.location} style={{ width: 20, height: 20 }} />
                            <Text style={styles.propertyDetails}>
                                {item.state
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                                ,{" "}
                                {item.city
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                            </Text>
                        </View>

                        <Text style={styles.propertyPrice}>
                            {formatCurrency(item.price, item.currency)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Uncomment if you want Share button UI 
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleShareProperty(item)}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity> 
        */}
            </View>
        );
    };

    return (
        <FlatList
            data={properties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id.toString()}
            // style={styles.propertiesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <Text style={styles.emptyText}>No properties found</Text>
            }
        />
    );
};

export default MarketPropertyList;

const styles = StyleSheet.create({
    propertyCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 20,
        width: "100%",
    },
    propertyInfo: {
        padding: 10,
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    propertyDescription: {
        fontSize: 16,
        paddingVertical: 5,
        color: "#444",
    },
    propertyDetails: {
        fontSize: 14,
        marginBottom: 5,
        color: "#666",
    },
    propertyType: {
        fontSize: 16,
        marginBottom: 5,
    },
    propertyPrice: {
        fontSize: 20,
        fontWeight: "600",
        marginVertical: 5,
        color: "#FB902E",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#aaa",
    },
});
