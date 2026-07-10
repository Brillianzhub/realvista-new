import { useState, useCallback } from "react";
import api from "@/lib/apiClient";

export const useUploadCoordinates = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadCoordinates = useCallback(
        async (latitude: number, longitude: number, slug: string) => {
            setIsLoading(true);
            setError(null);

            try {
                if (!slug) {
                    throw new Error("Missing property slug.");
                }

                const roundedLatitude = Number(Number(latitude).toFixed(6));
                const roundedLongitude = Number(Number(longitude).toFixed(6));

                const coordinatesPayload = {
                    latitude: roundedLatitude,
                    longitude: roundedLongitude,
                };

                console.log("📤 Sending coordinates payload:", coordinatesPayload);

                await api.post(
                    `/api/market/${slug}/coordinates/`,
                    coordinatesPayload
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
