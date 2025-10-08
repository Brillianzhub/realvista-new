import { useState, useEffect } from "react";

interface ImageFile {
    id: number;
    name: string;
    file: string;
    image_url: string | null;
    file_type: string;
    uploaded_at: string;
}

interface VideoFile {
    id: number;
    name: string;
    file: string;
    image_url: string | null;
    file_type: string;
    uploaded_at: string;
}

interface Owner {
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
}

interface Feature {
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
}

export interface PropertyDetails {
    id: number;
    title: string;
    description: string;
    property_type: string;
    price: number;
    currency: string;
    listing_purpose: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    availability: string;
    availability_date: string | null;
    bedrooms: number;
    bathrooms: string;
    square_feet: number;
    lot_size: string;
    year_built: number;
    views: number;
    inquiries: number;
    bookmarked: number;
    listed_date: string;
    updated_date: string;
    coordinate_url: string | null;
    images: string[];
    image_files: ImageFile[];
    documents: any[];
    videos: VideoFile[];
    owner: Owner;
    features: Feature[];
    payment_plans: any[];
    market_coordinates: any[];
}

interface UsePropertyDetailsReturn {
    property: PropertyDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const BASE_URL = "https://realvistamanagement.com/market/properties";

export const usePropertyDetails = (selectedItemId: string | number | null): UsePropertyDetailsReturn => {
    const [property, setProperty] = useState<PropertyDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPropertyDetails = async () => {
        if (!selectedItemId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/${selectedItemId}/`);
            if (!response.ok) {
                throw new Error(`Failed to fetch property with ID ${selectedItemId}`);
            }

            const data: PropertyDetails = await response.json();
            setProperty(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching property details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropertyDetails();
    }, [selectedItemId]);

    return { property, loading, error, refetch: fetchPropertyDetails };
};
