import { useState, useEffect } from "react";
import api from "@/lib/apiClient";

export interface PropertyImage {
    id: number;
    image: string;
    image_url: string | null;
    image_url_resolved: string | null;
    uploaded_at: string;
}

export interface PropertyFile {
    id: number;
    name: string;
    file: string;
    image_url: string | null;
    file_type: string;
    uploaded_at: string;
}

export interface PropertyFeature {
    id: number;
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

export interface PropertyCoordinate {
    id: number;
    latitude: number;
    longitude: number;
}

export interface PropertyDetails {
    id: number;
    title: string;
    slug: string;
    description: string;
    status: string;
    listing_purpose: string;
    category: string;
    property_type: string;
    price: string;
    currency: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    bedrooms: number;
    bathrooms: string;
    square_feet: number;
    lot_size: string;
    year_built: number;
    availability: string;
    availability_date: string | null;
    coordinate_url: string | null;
    youtube_url: string | null;
    views: number;
    inquiries: number;
    bookmarked: number;
    listed_date: string;
    updated_date: string;
    owner_name: string;
    owner_email: string;
    agent_id: number | null;
    is_bookmarked: boolean;
    images: PropertyImage[];
    files: PropertyFile[];
    features: PropertyFeature[];
    coordinates: PropertyCoordinate[];
}

interface UsePropertyDetailsReturn {
    property: PropertyDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const usePropertyDetails = (slug: string | null): UsePropertyDetailsReturn => {
    const [property, setProperty] = useState<PropertyDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPropertyDetails = async () => {
        if (!slug) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.get<PropertyDetails>(`/api/market/${slug}/`);
            setProperty(response.data);
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching property details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropertyDetails();
    }, [slug]);

    return { property, loading, error, refetch: fetchPropertyDetails };
};
