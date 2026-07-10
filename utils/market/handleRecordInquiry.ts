import api from "@/lib/apiClient";

/**
 * Records a property inquiry (increments inquiry count)
 * when a user clicks "Contact Owner".
 * @param slug - The slug of the property being inquired about.
 * @returns Promise<void>
 */
export const handleRecordInquiry = async (slug: string): Promise<void> => {
    if (!slug) {
        console.warn("Invalid property slug for inquiry record.");
        return;
    };

    try {
        await api.post(`/api/market/${slug}/inquiry/`);
    } catch (error: any) {
        console.error(
            "Error recording inquiry:",
            error.response?.data || error.message
        );
    };
};
