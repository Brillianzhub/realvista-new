import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Records a property inquiry (increments inquiry count)
 * when a user clicks "Contact Owner".
 * @param propertyId - The ID of the property being inquired about.
 * @returns Promise<void>
 */
export const handleRecordInquiry = async (propertyId: number): Promise<void> => {
    if (!propertyId) {
        console.warn("Invalid property ID for inquiry record.");
        return;
    };

    try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
            console.warn("Authentication token is missing. Inquiry not recorded.");
            return;
        };

        await axios.get(
            `https://www.realvistamanagement.com/market/inquiry-on-property/${propertyId}/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        // Optional: log or trigger an analytic event
        // console.log(`Inquiry recorded for property ID ${propertyId}`);
    } catch (error: any) {
        console.error(
            "Error recording inquiry:",
            error.response?.data || error.message
        );
    };
};
