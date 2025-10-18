import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SearchFilters {
    title: string;
    location: string;
    min_price: string;
    max_price: string;
}

export interface PropertySearchResult {
    id: number;
    title: string;
    city: string;
    state: string;
    currency: string;
    category: string;
    listing_purpose: string;
    property_type: string;
    price: string;
    short_description: string;
    preview_images: string[];
}

export const useSearchProperties = () => {
    const [properties, setProperties] = useState<PropertySearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchProperties = useCallback(
        async (filters: SearchFilters, isRefresh: boolean = false) => {
            // prevent search with no filters
            const hasFilter =
                filters.title.trim() ||
                filters.location.trim() ||
                filters.min_price.trim() ||
                filters.max_price.trim();

            if (!hasFilter) {
                setError("Please enter at least one search filter");
                setProperties([]);
                setHasSearched(false);
                return;
            }

            try {
                if (isRefresh) setRefreshing(true);
                else setLoading(true);
                setError(null);

                const token = await AsyncStorage.getItem("authToken");
                if (!token) throw new Error("Authentication required");

                const queryParams = new URLSearchParams();
                if (filters.title.trim())
                    queryParams.append("title", filters.title.trim());
                if (filters.location.trim())
                    queryParams.append("location", filters.location.trim());
                if (filters.min_price.trim())
                    queryParams.append("min_price", filters.min_price.trim());
                if (filters.max_price.trim())
                    queryParams.append("max_price", filters.max_price.trim());

                const url = `https://www.realvistamanagement.com/market/search-property/?${queryParams.toString()}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch properties");

                const data = await response.json();
                const results = Array.isArray(data.results) ? data.results : data;

                setProperties(results);
                setHasMore(false); // backend not paginated yet
                setHasSearched(true);
            } catch (err: any) {
                console.error("Error fetching properties:", err);
                setError(err.message || "Failed to load properties");
                setProperties([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
            }
        },
        []
    );

    const clearResults = useCallback(() => {
        setProperties([]);
        setError(null);
        setHasSearched(false);
        setCurrentPage(1);
        setHasMore(true);
    }, []);

    return {
        properties,
        loading,
        refreshing,
        loadingMore,
        error,
        hasMore,
        hasSearched,
        currentPage,
        fetchProperties,
        clearResults,
    };
};
