import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Increments the view count for a property when a user clicks to view it.
 * @param propertyId - The ID of the property being viewed.
 * @returns Promise<void>
 */
export const handleViewProperty = async (propertyId: number): Promise<void> => {
    if (!propertyId) {
        console.warn("Invalid property ID for view increment.");
        return;
    }

    try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
            throw new Error("Authentication token is missing");
        }

        await axios.get(
            `https://www.realvistamanagement.com/market/view-property/${propertyId}/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        // Optional: Log or handle success (for analytics, etc.)
        // console.log(`View recorded for property ID ${propertyId}`);
    } catch (error: any) {
        console.error(
            "Error viewing property:",
            error.response?.data || error.message
        );
    }
};
