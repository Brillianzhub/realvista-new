import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Bookmark = {
    bookmark_id: number;
    property_id: number;
    title: string;
    address: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    property_type: string;
    listing_purpose: string;
    images: string[];
    bookmarked_at: string;
};

export type UseUserBookmarkReturn = {
    bookmarks: Bookmark[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

export default function useUserBookmark(): UseUserBookmarkReturn {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookmarks = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await fetch('https://www.realvistamanagement.com/market/user-bookmarks/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch bookmarks: ${response.status}`);
            }

            const data = await response.json();
            setBookmarks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching bookmarks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    return {
        bookmarks,
        loading,
        error,
        refetch: fetchBookmarks,
    };
}
