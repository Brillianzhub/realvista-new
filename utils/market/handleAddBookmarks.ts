import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { Alert } from 'react-native';

interface BookmarkResponse {
    message?: string;
    error?: string;
}

export const handleAddBookmark = async (propertyId: string | number): Promise<boolean> => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            Alert.alert('Error', 'Authentication token is missing.');
            return false;
        }

        const response = await axios.post<BookmarkResponse>(
            `https://www.realvistamanagement.com/market/bookmark-property/${propertyId}/`,
            {},
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        const isBookmarked =
            response.data.message === 'Property successfully added to your favorite collections.';

        return isBookmarked;
    } catch (err) {
        const error = err as AxiosError<BookmarkResponse>;
        const errorMessage = error.response?.data?.message;

        if (
            error.response?.status === 400 &&
            (errorMessage === 'Property is already added to your favorite collections.' ||
                errorMessage === 'Property is already added to your favorite collections.')
        ) {
            Alert.alert('Info', 'This property is already added to your favorite collections.');
            return true;
        }

        console.error(
            'Error adding property to your favorite collections:',
            error.response?.data || error.message
        );

        if (error.response?.status === 404) {
            Alert.alert('Error', 'The property does not exist.');
        } else {
            Alert.alert(
                'Error',
                error.response?.data?.error ||
                'An error occurred while adding the property to your favorite collections.'
            );
        }

        return false;
    }
};
