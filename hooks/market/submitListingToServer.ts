import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const submitListingToServer = async (listingId: string, token: string) => {
    try {
        const storedListings = await AsyncStorage.getItem("marketplaceListings");
        if (!storedListings) {
            console.warn("No stored listings found.");
            return;
        }

        const listings = JSON.parse(storedListings);
        const listing = listings.find((l: any) => l.id === listingId);

        if (!listing) {
            console.warn("Listing not found.");
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
            status: listing.status || "Draft",
        };

        // console.log("📤 Sending basic property data...");
        const basicResponse = await axios.post(
            `https://www.realvistamanagement.com/market/list-property/`,
            basicPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            }
        );

        const propertyId = basicResponse.data?.data?.id;
        if (!propertyId) throw new Error("Property ID not returned from API.");

        // console.log("✅ Basic property created:", propertyId);

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

        await axios.post(
            "https://realvistamanagement.com/market/property/coordinates/",
            coordinatesPayload,
            {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            }
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
        await axios.post(
            `https://realvistamanagement.com/market/property/${propertyId}/features/`,
            featuresPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
            }
        );
        // console.log("✅ Features uploaded.");

        // ===============================
        // 4️⃣ POST MEDIA FILES (IMAGES/VIDEOS)
        // ===============================
        if (listing.images && listing.images.length > 0) {
            // console.log("📤 Uploading media files...");

            for (const fileUri of listing.images) {
                const formData = new FormData();
                formData.append("property", propertyId);
                formData.append("file", {
                    uri: fileUri,
                    name: fileUri.split("/").pop(),
                    type: "image/jpeg",
                } as any);

                await axios.post(
                    "https://realvistamanagement.com/market/upload-file-market/",
                    formData,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            // console.log(`✅ Uploaded ${listing.images.length} file(s).`);
        }

        // ===============================
        // ✅ FINISH
        // ===============================
        // console.log("🎉 Listing submission completed successfully for:", listing.title);

        // Optionally update AsyncStorage to mark listing as published
        const updatedListings = listings.map((l: any) =>
            l.id === listingId ? { ...l, status: "Published", property_id: propertyId } : l
        );
        await AsyncStorage.setItem("marketplaceListings", JSON.stringify(updatedListings));

        return propertyId;
    } catch (error: any) {
        console.error("❌ Error submitting listing:", error.response?.data || error.message);
        throw error;
    }
};
