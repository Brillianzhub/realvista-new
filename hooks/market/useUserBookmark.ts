import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

// Define types for a bookmark
export interface Bookmark {
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
}


// Define the hook return type
interface UseUserBookmarkReturn {
    bookmarks: Bookmark[];
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    fetchBookmarks: () => Promise<void>;
    error: string | null;
}

const useUserBookmarks = (): UseUserBookmarkReturn => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                throw new Error("Authentication token is missing!");
            }

            const response = await axios.get<Bookmark[]>(
                `https://www.realvistamanagement.com/market/user-bookmarks/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setBookmarks(response.data);
        } catch (error: any) {
            setError(error.response?.data?.detail || error.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    return { bookmarks, loading, error, setLoading, fetchBookmarks };
};

export default useUserBookmarks;
