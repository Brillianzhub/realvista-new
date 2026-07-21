import { useState, useCallback } from "react";
import api from "@/lib/apiClient";

export interface SearchFilters {
    title: string;
    location: string;
    min_price: string;
    max_price: string;
    property_type: string;
    listing_purpose: string;
    city: string;
    state: string;
}

export interface PropertySearchResult {
    id: number;
    slug: string;
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

const buildSearchUrl = (filters: SearchFilters): string => {
    const queryParams = new URLSearchParams();
    if (filters.title.trim()) queryParams.append("title", filters.title.trim());
    if (filters.location.trim())
        queryParams.append("location", filters.location.trim());
    if (filters.min_price.trim())
        queryParams.append("min_price", filters.min_price.trim());
    if (filters.max_price.trim())
        queryParams.append("max_price", filters.max_price.trim());
    if (filters.property_type.trim())
        queryParams.append("property_type", filters.property_type.trim());
    if (filters.listing_purpose.trim())
        queryParams.append("listing_purpose", filters.listing_purpose.trim());
    if (filters.city.trim()) queryParams.append("city", filters.city.trim());
    if (filters.state.trim()) queryParams.append("state", filters.state.trim());

    return `/api/market/?${queryParams.toString()}`;
};

export const useSearchProperties = () => {
    const [properties, setProperties] = useState<PropertySearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchProperties = useCallback(
        async (filters: SearchFilters, isRefresh: boolean = false) => {
            // prevent search with no filters
            const hasFilter =
                filters.title.trim() ||
                filters.location.trim() ||
                filters.min_price.trim() ||
                filters.max_price.trim() ||
                filters.property_type.trim() ||
                filters.listing_purpose.trim() ||
                filters.city.trim() ||
                filters.state.trim();

            if (!hasFilter) {
                setError("Please enter at least one search filter");
                setProperties([]);
                setHasSearched(false);
                setHasMore(false);
                setNextUrl(null);
                return;
            }

            try {
                if (isRefresh) setRefreshing(true);
                else setLoading(true);
                setError(null);

                const url = buildSearchUrl(filters);
                const response = await api.get(url);

                const data = response.data;
                const results = Array.isArray(data) ? data : data.results ?? [];

                setProperties(results); // page 1 — replace
                setHasMore(!!data.next);
                setNextUrl(data.next ?? null);
                setHasSearched(true);
            } catch (err: any) {
                console.error("Error fetching properties:", err);
                setError(err.message || "Failed to load properties");
                setProperties([]);
                setHasMore(false);
                setNextUrl(null);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    const loadMore = useCallback(async () => {
        if (!nextUrl || loadingMore || loading || refreshing) return;

        try {
            setLoadingMore(true);
            const response = await api.get(nextUrl);

            const data = response.data;
            const results = Array.isArray(data) ? data : data.results ?? [];

            setProperties((prev) => [...prev, ...results]); // append
            setHasMore(!!data.next);
            setNextUrl(data.next ?? null);
        } catch (err: any) {
            console.error("Error loading more properties:", err);
        } finally {
            setLoadingMore(false);
        }
    }, [nextUrl, loadingMore, loading, refreshing]);

    const clearResults = useCallback(() => {
        setProperties([]);
        setError(null);
        setHasSearched(false);
        setHasMore(false);
        setNextUrl(null);
    }, []);

    return {
        properties,
        loading,
        refreshing,
        loadingMore,
        error,
        hasMore,
        hasSearched,
        fetchProperties,
        loadMore,
        clearResults,
    };
};
