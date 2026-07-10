import api from "@/lib/apiClient";

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
        // TODO: no view-count endpoint in new API — call removed
    } catch (error: any) {
        console.error(
            "Error viewing property:",
            error.response?.data || error.message
        );
    }
};
