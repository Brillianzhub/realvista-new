import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Linking } from "react-native";

// ---- Types ----
type Owner = {
    phone_number?: string;
};

type Property = {
    id: string | number;
    title?: string;
    address?: string;
    property_type?: string;
    owner?: Owner;
    [key: string]: any;
};

type User = {
    name?: string;
    [key: string]: any;
};

type ContactViaWhatsAppParams = {
    property: Property;
    user: User;
    setIsRecordingInquiry?: (value: boolean) => void;
};

// ---- Function ----
export const contactViaWhatsApp = async ({
    property,
    user,
    setIsRecordingInquiry,
}: ContactViaWhatsAppParams): Promise<void> => {
    if (!property || !property.owner?.phone_number || !user || !user.name) {
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
    const propertyName = property.title ?? "Unknown Property";
    const propertyLocation = property.address ?? "Unknown Location";
    const propertyType = property.property_type ?? "Unknown Type";
    const userName = user.name ?? "Anonymous User";

    const message = `Hello, I am ${userName}, and I am interested in your property titled "${propertyName}" (${propertyType}) located at ${propertyLocation}. I would like to learn more about the property, including availability and pricing.`;

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappURL).catch((err) => {
        console.error("An error occurred", err);
        Alert.alert(
            "Error",
            "Unable to open WhatsApp. Please ensure you have the WhatsApp application installed on your device."
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
