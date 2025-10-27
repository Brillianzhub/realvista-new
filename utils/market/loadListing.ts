// src/utils/market/loadListing.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mapBackendToFrontend } from '@/utils/market/marketplaceMapper';
import { type MarketplaceListing } from '@/data/marketplaceListings';

/**
 * Loads a listing either from local drafts or from backend listings.
 *
 * @param listingId - The ID of the listing (can be a local or backend-prefixed ID)
 * @param properties - The list of backend properties (if available)
 * @returns The found listing object or null
 */
export const loadListing = async (
    listingId: string,
    properties?: any[]
): Promise<MarketplaceListing | null> => {
    try {
        // 1️⃣ Load locally stored draft listings
        const storedListings = await AsyncStorage.getItem('marketplaceListings');
        const draftListings: MarketplaceListing[] = storedListings ? JSON.parse(storedListings) : [];

        // 2️⃣ Try to find locally first
        let foundListing = draftListings.find((l) => l.id === listingId);

        // 3️⃣ If not found, try backend listings
        if (!foundListing && properties?.length) {
            const backendListing = properties.find((p) => `backend_${p.id}` === listingId);
            if (backendListing) {
                foundListing = mapBackendToFrontend(backendListing);
            }
        }

        return foundListing || null;
    } catch (error) {
        console.error('Error loading listing:', error);
        return null;
    }
};
