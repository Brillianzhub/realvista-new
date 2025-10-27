import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UseDeleteImageResult {
    deleteImage: (fileId: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

export const useDeleteImage = (): UseDeleteImageResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteImage = useCallback(async (fileId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                setError("Authentication token not found. Please log in.");
                return false;
            }

            await axios.delete(`https://realvistamanagement.com/market/delete-file/${fileId}/`, {
                headers: { Authorization: `Token ${token}` },
            });

            console.log("✅ Image deleted successfully:", fileId);
            return true;
        } catch (error) {
            const axiosError = error as AxiosError<{ detail?: string }>;
            const message = axiosError.response?.data?.detail || "Failed to delete image";
            console.error("❌ Error deleting image:", message);
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteImage, loading, error };
};
