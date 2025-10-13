export type PropertyFeatures = {
    hasElectricity: boolean;
    hasWaterSupply: boolean;
    hasGarden: boolean;
    hasSecurity: boolean;
    hasParking: boolean;
    isFenced: boolean;
    proximityToRoad: 'Close' | 'Moderate' | 'Far' | '';
    nearbyAmenities: string[];
};

export type MarketplaceListing = {
    id: string;
    user_id: string;
    property_id?: string;
    listing_type: 'Corporate' | 'P2P';
    property_name: string;
    property_type: string;
    location: string;
    city?: string;
    state?: string;
    description: string;
    property_value: number;
    market_type?: 'Sale' | 'Rent';
    roi_percentage: number;
    estimated_yield: number;
    latitude?: number;
    longitude?: number;
    thumbnail_url?: string;
    images?: string[];
    features?: PropertyFeatures;
    status: 'Draft' | 'Published' | 'Removed';
    completion_percentage: number;
    current_step: number;
    removal_reason?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    backendData?: any;
};

// export const marketplaceListingsData: MarketplaceListing[] = [


// ];

// export const getListingById = (id: string): MarketplaceListing | undefined => {
//     return marketplaceListingsData.find((listing) => listing.id === id);
// };

// export const getListingsByType = (type: 'Corporate' | 'P2P' | 'All'): MarketplaceListing[] => {
//     if (type === 'All') return marketplaceListingsData;
//     return marketplaceListingsData.filter((listing) => listing.listing_type === type);
// };

// export const getListingsByStatus = (
//     status: 'Draft' | 'Published' | 'Removed' | 'All'
// ): MarketplaceListing[] => {
//     if (status === 'All') return marketplaceListingsData;
//     return marketplaceListingsData.filter((listing) => listing.status === status);
// };
