import api from '@/lib/apiClient';
import { AxiosError } from 'axios';
import { Alert } from 'react-native';

interface BookmarkResponse {
    bookmarked: boolean;
}

export const handleAddBookmark = async (slug: string): Promise<boolean> => {
    try {
        const response = await api.post<BookmarkResponse>(
            `/api/market/${slug}/bookmark/`,
            {}
        );

        return response.data.bookmarked;
    } catch (err) {
        const error = err as AxiosError<{ error?: string; detail?: string }>;

        console.error(
            'Error updating bookmark:',
            error.response?.data || error.message
        );

        if (error.response?.status === 404) {
            Alert.alert('Error', 'The property does not exist.');
        } else {
            Alert.alert(
                'Error',
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'An error occurred while updating your favorite collections.'
            );
        }

        return false;
    }
};
