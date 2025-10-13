import { type MarketplaceListing, type PropertyFeatures } from '@/data/marketplaceListings';

export type BackendProperty = {
    id: number;
    title: string;
    description: string;
    property_type: string;
    price: string;
    currency: string;
    listing_purpose: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    availability: string;
    availability_date: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
    lot_size: string | null;
    year_built: number | null;
    views: number;
    inquiries: number;
    bookmarked: number;
    listed_date: string;
    updated_date: string;
    coordinate_url: string | null;
    images: any[];
    image_files: Array<{
        id: number;
        name: string;
        file: string;
        image_url: string | null;
        file_type: string;
        uploaded_at: string;
    }>;
    documents: any[];
    videos: any[];
    owner: {
        id: number;
        owner_bio: string;
        owner_rating: number | null;
        email: string;
        phone_number: string;
        owner_name: string;
        owner_photo: string;
        contact_by_email: boolean;
        contact_by_whatsapp: boolean;
        contact_by_phone: boolean;
        active_since: string;
        base_city: string;
        base_state: string;
    };
    features: Array<{
        negotiable: string;
        furnished: boolean;
        pet_friendly: boolean;
        parking_available: boolean;
        swimming_pool: boolean;
        garden: boolean;
        electricity_proximity: string;
        road_network: string;
        development_level: string;
        water_supply: boolean;
        security: boolean;
        additional_features: string | null;
        verified_user: boolean;
    }>;
    payment_plans: any[];
    market_coordinates: Array<{
        id: number;
        latitude: number;
        longitude: number;
    }>;
};

export function mapBackendToFrontend(backendProperty: BackendProperty): MarketplaceListing {
    const features = backendProperty.features[0];
    const coordinates = backendProperty.market_coordinates[0];

    const mappedFeatures: PropertyFeatures = {
        hasElectricity: features?.water_supply || false,
        hasWaterSupply: features?.water_supply || false,
        hasGarden: features?.garden || false,
        hasSecurity: features?.security || false,
        hasParking: features?.parking_available || false,
        isFenced: false,
        proximityToRoad: mapRoadNetwork(features?.road_network),
        nearbyAmenities: [],
    };

    const imageUrls = backendProperty.image_files.map(img => img.file);
    const thumbnailUrl = imageUrls.length > 0 ? imageUrls[0] : undefined;

    const propertyValue = parseFloat(backendProperty.price);

    return {
        id: `backend_${backendProperty.id}`,
        user_id: backendProperty.owner.email,
        listing_type: 'Corporate',
        property_name: backendProperty.title,
        property_type: capitalizePropertyType(backendProperty.property_type),
        location: backendProperty.address,
        city: backendProperty.city,
        state: backendProperty.state,
        description: backendProperty.description,
        property_value: propertyValue,
        market_type: backendProperty.listing_purpose === 'sale' ? 'Sale' : 'Rent',
        roi_percentage: 0,
        estimated_yield: 0,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        thumbnail_url: thumbnailUrl,
        images: imageUrls,
        features: mappedFeatures,
        status: 'Published',
        completion_percentage: 100,
        current_step: 5,
        created_at: backendProperty.listed_date,
        updated_at: backendProperty.updated_date,
        published_at: backendProperty.listed_date,
        backendData: backendProperty,
    } as MarketplaceListing & { backendData?: BackendProperty };
}

function mapRoadNetwork(roadNetwork?: string): 'Close' | 'Moderate' | 'Far' | '' {
    if (!roadNetwork) return '';

    const normalized = roadNetwork.toLowerCase();
    if (normalized === 'good' || normalized === 'excellent') return 'Close';
    if (normalized === 'moderate' || normalized === 'fair') return 'Moderate';
    if (normalized === 'poor' || normalized === 'bad') return 'Far';

    return '';
}

function capitalizePropertyType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export function isBackendListing(listing: MarketplaceListing): boolean {
    return listing.id.startsWith('backend_');
}

export function getBackendId(listing: MarketplaceListing): number | null {
    if (isBackendListing(listing)) {
        const id = listing.id.replace('backend_', '');
        return parseInt(id, 10);
    }
    return null;
}
