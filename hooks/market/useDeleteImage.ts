import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/apiClient";

interface UseDeleteImageResult {
    deleteImage: (slug: string, imageId: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

export const useDeleteImage = (): UseDeleteImageResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteImage = useCallback(async (slug: string, imageId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await api.delete(`/api/market/${slug}/images/${imageId}/`);

            console.log("✅ Image deleted successfully:", imageId);
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
