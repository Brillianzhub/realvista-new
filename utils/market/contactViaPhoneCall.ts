import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Linking } from "react-native";

// ---- Types ----
type Owner = {
    phone_number?: string;
};

type Property = {
    id: string | number;
    owner?: Owner;
    [key: string]: any;
};

type User = {
    name?: string;
    [key: string]: any;
};

type ContactViaPhoneCallParams = {
    property: Property;
    user: User;
    setIsRecordingInquiry?: (value: boolean) => void;
};

// ---- Function ----
export const contactViaPhoneCall = async ({
    property,
    user,
    setIsRecordingInquiry,
}: ContactViaPhoneCallParams): Promise<void> => {
    if (!property || !property.owner?.phone_number || !user) {
        Alert.alert("Error", "Phone number or user information is missing.");
        return;
    }

    setIsRecordingInquiry?.(true);

    try {
        await recordInquiry(property.id);
    } catch (error: any) {
        console.error("Error recording inquiry:", error.response?.data || error.message);
        Alert.alert("Error", "Unable to record inquiry. Please try again.");
        setIsRecordingInquiry?.(false);
        return;
    }

    setIsRecordingInquiry?.(false);

    const phoneNumber = property.owner.phone_number;
    const telURL = `tel:${phoneNumber}`;

    Linking.openURL(telURL).catch((err) => {
        console.error("An error occurred", err);
        Alert.alert(
            "Error",
            "Unable to make the call. Please ensure your device supports phone calls and try again."
        );
    });
};

// ---- Helper ----
const recordInquiry = async (propertyId: string | number): Promise<void> => {
    try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
            Alert.alert("Error", "Authentication token is missing.");
            return;
        }

        await axios.get(
            `https://www.realvistamanagement.com/market/inquiry-on-property/${propertyId}/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
    } catch (error: any) {
        console.error("Error recording inquiry:", error.response?.data || error.message);
        throw new Error(
            error.response?.data?.detail || "An error occurred while recording the inquiry."
        );
    }
};
