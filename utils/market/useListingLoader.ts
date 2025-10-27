import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MarketplaceListing } from '@/data/marketplaceListings';
import { mapBackendToFrontend } from './marketplaceMapper';

// Optional helper you already have

type UseListingLoaderProps = {
    listingId: string | null;
    properties?: any[]; // or use your backend listing type if defined
    onListingLoaded?: (listing: MarketplaceListing) => void;
};

export const useListingLoader = ({
    listingId,
    properties,
    onListingLoaded,
}: UseListingLoaderProps) => {
    const [listing, setListing] = useState<MarketplaceListing | null>(null);
    const [loading, setLoading] = useState(false);

    const loadListing = useCallback(async () => {
        if (!listingId) return;

        setLoading(true);
        try {
            // 1️⃣ Load local draft listings
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            const draftListings: MarketplaceListing[] = storedListings
                ? JSON.parse(storedListings)
                : [];

            // 2️⃣ Find locally
            let foundListing = draftListings.find((l) => l.id === listingId);

            // 3️⃣ If not found locally, check backend listings
            if (!foundListing && properties?.length) {
                const backendListing = properties.find(
                    (p) => `backend_${p.id}` === listingId
                );
                if (backendListing) {
                    foundListing = mapBackendToFrontend(backendListing);
                }
            }

            if (foundListing) {
                setListing(foundListing);
                onListingLoaded?.(foundListing);
            } else {
                console.warn('Listing not found:', listingId);
                setListing(null);
            }
        } catch (error) {
            console.error('❌ Error loading listing:', error);
            setListing(null);
        } finally {
            setLoading(false);
        }
    }, [listingId, properties]);

    useEffect(() => {
        loadListing();
    }, [loadListing]);

    return { listing, loading, reloadListing: loadListing };
};
