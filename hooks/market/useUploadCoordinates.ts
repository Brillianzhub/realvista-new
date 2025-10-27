import { useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUploadCoordinates = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadCoordinates = useCallback(
        async (latitude: number, longitude: number, propertyId: string | number) => {
            setIsLoading(true);
            setError(null);

            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) {
                    throw new Error("Authentication token not found!");
                }

                // 🧩 Extract numeric ID if prefixed (e.g., "backend_137" → 137)
                const numericPropertyId = Number(String(propertyId).replace("backend_", ""));
                if (isNaN(numericPropertyId)) {
                    throw new Error(`Invalid property ID format: ${propertyId}`);
                }

                const roundedLatitude = Number(Number(latitude).toFixed(6));
                const roundedLongitude = Number(Number(longitude).toFixed(6));

                const coordinatesPayload = {
                    property: numericPropertyId, // ✅ clean numeric ID
                    coordinates: [
                        {
                            latitude: roundedLatitude,
                            longitude: roundedLongitude,
                        },
                    ],
                };

                console.log("📤 Sending coordinates payload:", coordinatesPayload);

                await axios.post(
                    "https://realvistamanagement.com/market/property/coordinates/",
                    coordinatesPayload,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                return { success: true, message: "Coordinates uploaded successfully." };
            } catch (err: any) {
                console.error("❌ Coordinate upload error:", err.response?.data || err.message);
                const msg =
                    err.response?.data?.detail ||
                    JSON.stringify(err.response?.data) ||
                    err.message ||
                    "Failed to upload coordinates.";
                setError(msg);
                return { success: false, message: msg };
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { uploadCoordinates, isLoading, error };
};
