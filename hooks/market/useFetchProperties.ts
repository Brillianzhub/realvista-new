import { useState, useEffect, useCallback } from "react";
import api from "@/lib/apiClient";

// Define a type for a Property (adjust based on API response)
interface Property {
    id: number;
    slug: string;
    title: string;
    description: string;
    city: string;
    state: string;
    price: number;
    [key: string]: any; // fallback for extra fields
}

// Define the filter shape
interface Filters {
    description: string;
    city: string;
    state: string;
    minPrice: number | null;
    maxPrice: number | null;
    generalSearch: string;
}

// Hook return type
interface UseFetchPropertiesResult {
    properties: Property[];
    fetchProperties: () => Promise<void>;
    loading: boolean;
    error: string | null;
    applyFilters: (newFilters: Filters) => void;
}

const useFetchProperties = (): UseFetchPropertiesResult => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        description: "",
        city: "",
        state: "",
        minPrice: null,
        maxPrice: null,
        generalSearch: "",
    });

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get("/api/market/", {
                params: {
                    description: filters.description,
                    city: filters.city,
                    state: filters.state,
                    min_price: filters.minPrice ?? undefined,
                    max_price: filters.maxPrice ?? undefined,
                    general_search: filters.generalSearch,
                },
            });

            setProperties(response.data.results as Property[]);
        } catch (err: any) {
            console.error("Error fetching properties:", err);
            setError(err.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const applyFilters = useCallback((newFilters: Filters) => {
        setFilters(newFilters);
    }, []);

    return { properties, fetchProperties, loading, error, applyFilters };
};

export default useFetchProperties;
