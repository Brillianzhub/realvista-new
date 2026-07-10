import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { uploadFile } from '@/lib/apiClient';

// TODO: remove token arg from external callers — no longer needed
export const submitListingToServer = async (
  listingId: string,
) => {
  try {
    const storedListings = await AsyncStorage.getItem('marketplaceListings');
    if (!storedListings) {
      console.warn('No stored listings found.');
      return;
    }

    const listings = JSON.parse(storedListings);
    const listing = listings.find((l: any) => l.id === listingId);

    if (!listing) {
      console.warn('Listing not found.');
      return;
    }

    // console.log("🚀 Starting submission for:", listing.title);

    // ===============================
    // 1️⃣ POST BASIC PROPERTY DATA
    // ===============================
    const basicPayload = {
      title: listing.title,
      property_name: listing.property_name,
      description: listing.description,
      category: listing.category,
      property_type: listing.property_type,
      price: listing.price,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      location: listing.location,
      zip_code: listing.zip_code,
      currency: listing.currency,
      listing_purpose: listing.listing_purpose,
      listing_type: listing.listing_type,
      market_type: listing.market_type,

      estimated_yield: listing.estimated_yield,
      roi_percentage: listing.roi_percentage,
      availability: listing.availability,
      availability_date: listing.availability_date,
      lot_size: listing.lot_size,
      year_built: listing.year_built,
      status: listing.status || 'Draft',
    };

    // console.log("📤 Sending basic property data...");
    const basicResponse = await api.post(
      `/api/market/create/`,
      basicPayload,
    );

    const propertyId = basicResponse.data?.data?.id;
    if (!propertyId) throw new Error('Property ID not returned from API.');
    // TODO: the new API addresses listings by slug for coordinates/features/
    // file-upload sub-resources (/api/market/${slug}/...). Not wired up here
    // since the create response's slug field hasn't been confirmed — the
    // 3 calls below stay on the legacy id-based endpoints for now.

    // ===============================
    // 2️⃣ POST COORDINATES
    // ===============================

    const roundedLatitude = Number(Number(listing.latitude).toFixed(6));
    const roundedLongitude = Number(Number(listing.longitude).toFixed(6));

    const coordinatesPayload = {
      property: propertyId,
      coordinates: [
        {
          latitude: roundedLatitude,
          longitude: roundedLongitude,
        },
      ],
    };

    // console.log("📤 Sending coordinates payload:", coordinatesPayload);

    await api.post(
      '/market/property/coordinates/',
      coordinatesPayload,
    );

    // console.log("✅ Coordinates uploaded.");

    // ===============================
    // 3️⃣ POST PROPERTY FEATURES
    // ===============================
    const featuresPayload = {
      ...listing.features,
      property: propertyId,
    };

    // console.log("📤 Sending features...");
    await api.post(
      `/market/property/${propertyId}/features/`,
      featuresPayload,
    );
    // console.log("✅ Features uploaded.");

    // ===============================
    // 4️⃣ POST MEDIA FILES (IMAGES/VIDEOS)
    // ===============================
    if (listing.images && listing.images.length > 0) {
      // console.log("📤 Uploading media files...");

      for (const fileUri of listing.images) {
        const formData = new FormData();
        formData.append('property', propertyId);
        formData.append('file', {
          uri: fileUri,
          name: fileUri.split('/').pop(),
          type: 'image/jpeg',
        } as any);

        await uploadFile('/market/upload-file-market/', formData);
      }

      // console.log(`✅ Uploaded ${listing.images.length} file(s).`);
    }

    // ===============================
    // ✅ FINISH
    // ===============================
    // console.log("🎉 Listing submission completed successfully for:", listing.title);

    // Optionally update AsyncStorage to mark listing as published
    const updatedListings = listings.map((l: any) =>
      l.id === listingId
        ? { ...l, status: 'Published', property_id: propertyId }
        : l,
    );
    await AsyncStorage.setItem(
      'marketplaceListings',
      JSON.stringify(updatedListings),
    );

    return propertyId;
  } catch (error: any) {
    console.error(
      '❌ Error submitting listing:',
      error.response?.data || error.message,
    );
    throw error;
  }
};
