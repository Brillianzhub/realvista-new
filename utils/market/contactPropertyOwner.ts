import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Linking } from "react-native";

// ---- Types ----
type Owner = {
    email?: string;
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
    email?: string;
    [key: string]: any;
};

type ContactPropertyOwnerParams = {
    property: Property;
    user: User;
    setIsRecordingInquiry?: (value: boolean) => void;
};

// ---- Function ----
export const contactPropertyOwner = async ({
    property,
    user,
    setIsRecordingInquiry,
}: ContactPropertyOwnerParams): Promise<void> => {
    if (!property || !property.owner?.email || !user || !user.name || !user.email) {
        Alert.alert("Error", "Property or user information is missing.");
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

    const ownerEmail = property.owner.email;
    const propertyName = property.title ?? "Unknown Property";
    const propertyLocation = property.address ?? "Unknown Location";
    const propertyType = property.property_type ?? "Unknown Type";
    const userName = user.name ?? "Anonymous User";
    const userEmail = user.email ?? "No Email";

    const subject = `Interest in Your Property Listing: ${propertyName}`;
    const body = `Hello,\n\nI am ${userName} (${userEmail}), and I am interested in your property titled "${propertyName}" (${propertyType}) located at ${propertyLocation}. I came across this listing on the Realvista platform and would like to learn more about the property, including any additional details, availability, and pricing.\n\nPlease let me know how I can proceed or reach out for further discussions. Looking forward to your response.\n\nBest regards,\n${userName}`;

    const mailto = `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
    )}`;

    Linking.openURL(mailto).catch((err) => {
        console.error("An error occurred", err);
        Alert.alert(
            "Error",
            "Unable to open email client. Please ensure you have a mail application installed on your device."
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
