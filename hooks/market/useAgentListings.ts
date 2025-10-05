import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface Listing {
    id: number;
    title: string;
    city: string;
    state: string;
    currency: string;
    price: number;
    short_description: string;
    preview_images: string[];
}

export const useAgentListings = () => {
    const BASE_URL = "https://www.realvistamanagement.com/market/fetch-listing/";

    const [properties, setProperties] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextUrl, setNextUrl] = useState<string | null>(BASE_URL);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch listings with optional append flag
    const fetchListings = useCallback(
        async (url: string | null, append = false) => {
            if (!url) return;
            setLoading(true);

            try {
                const res = await axios.get(url);
                const data = res.data;

                const listings: Listing[] = data.results || data;
                setNextUrl(data.next);

                setProperties((prev) =>
                    append ? [...prev, ...listings] : listings
                ); // ✅ Append if true, replace if false
            } catch (err) {
                console.error("❌ Failed to fetch listings:", err);
                setError("Failed to load listings");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Initial load
    useEffect(() => {
        fetchListings(BASE_URL, false);
    }, []);

    const loadMore = () => {
        if (nextUrl && !loading) fetchListings(nextUrl, true);
    };

    const refresh = async () => {
        setRefreshing(true);
        await fetchListings(BASE_URL, false);
        setRefreshing(false);
    };

    return { properties, loading, error, loadMore, hasMore: !!nextUrl, refresh, refreshing };
};
