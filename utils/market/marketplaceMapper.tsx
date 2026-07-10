import {
  type MarketplaceListing,
  type PropertyFeatures,
} from '@/data/marketplaceListings';

export type BackendProperty = {
  id: number;
  slug: string;
  title: string;
  property_type: string;
  price: string;
  currency: string;
  listing_purpose: string;
  category: string;
  city: string;
  state: string;
  availability: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  views: number;
  inquiries: number;
  bookmarked: number;
  listed_date: string;
  owner_name: string;
  owner_email: string;
  status?: string;
  // Card-serializer fields (/api/market/, /api/market/my/)
  cover_image?: string | null;
  short_description?: string;
  preview_images?: string[];
  // Detail-serializer-only fields (/api/market/<slug>/) — undefined when this
  // object comes from a card response (e.g. /api/market/my/).
  description?: string;
  address?: string;
  zip_code?: string;
  availability_date?: string | null;
  lot_size?: string | null;
  year_built?: number | null;
  updated_date?: string;
  coordinate_url?: string | null;
  images?: Array<{ id: number; image: string | null; image_url: string | null }>;
  files?: Array<{
    id: number;
    name: string;
    file: string | null;
    image_url: string | null;
    file_type: string;
    uploaded_at: string;
  }>;
  features?: Array<{
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
  coordinates?: Array<{
    id: number;
    latitude: number;
    longitude: number;
  }>;
};

export function mapBackendToFrontend(
  backendProperty: BackendProperty
): MarketplaceListing {
  // Features only available on detail view — fetch /api/market/<slug>/ for full data
  const features = backendProperty.features?.[0];

  const mappedFeatures: PropertyFeatures = {
    negotiable: features?.negotiable ?? 'no',
    furnished: features?.furnished ?? false,
    pet_friendly: features?.pet_friendly ?? false,
    parking_available: features?.parking_available ?? false,
    swimming_pool: features?.swimming_pool ?? false,
    garden: features?.garden ?? false,
    electricity_proximity: features?.electricity_proximity ?? '',
    road_network: features?.road_network ?? '',
    development_level: features?.development_level ?? '',
    water_supply: features?.water_supply ?? false,
    security: features?.security ?? false,
  };

  // Coordinates only available on detail view — fetch /api/market/<slug>/ for full data
  const coordinates = backendProperty.coordinates?.[0];

  // Card serializer returns preview_images as plain URL strings (max 4);
  // detail-only image_files/id data isn't present on card responses.
  const previewImages = backendProperty.preview_images ?? [];
  const imageData = previewImages.map((url, i) => ({ id: i, url }));
  const thumbnailUrl =
    backendProperty.cover_image ?? previewImages[0] ?? undefined;

  const propertyValue = parseFloat(backendProperty.price);

  return {
    id: `backend_${backendProperty.id}`,
    slug: backendProperty.slug,
    user_id: backendProperty.owner_email ?? '',
    category: backendProperty.category,
    property_name: backendProperty.title,
    property_type: capitalizePropertyType(backendProperty.property_type),
    location: backendProperty.address ?? '',
    city: backendProperty.city,
    state: backendProperty.state,
    currency: backendProperty.currency,
    description: backendProperty.description ?? backendProperty.short_description ?? '',
    short_description: backendProperty.short_description ?? '',
    property_value: propertyValue,
    bedrooms: backendProperty.bedrooms,
    bathrooms: backendProperty.bathrooms,
    square_feet: backendProperty.square_feet,
    lot_size: backendProperty.lot_size ?? null,
    year_built: backendProperty.year_built ?? null,
    market_type: backendProperty.listing_purpose === 'sale' ? 'Sale' : 'Rent',
    roi_percentage: 0,
    estimated_yield: 0,
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    thumbnail_url: thumbnailUrl,
    images: previewImages,
    image_objects: imageData,
    features: mappedFeatures,
    status: 'Published',
    completion_percentage: 100,
    current_step: 5,
    created_at: backendProperty.listed_date,
    updated_at: backendProperty.updated_date ?? backendProperty.listed_date,
    published_at: backendProperty.listed_date,
    backendData: backendProperty,
  } as unknown as MarketplaceListing & {
    backendData?: BackendProperty;
    image_objects?: { id: number; url: string }[];
    short_description?: string;
  };
}

function mapRoadNetwork(
  roadNetwork?: string
): 'Close' | 'Moderate' | 'Far' | '' {
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
