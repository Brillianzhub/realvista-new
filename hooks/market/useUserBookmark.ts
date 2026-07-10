import { useState, useEffect } from 'react';
import api from '@/lib/apiClient';

export type Bookmark = {
  id: number;
  property: number;
  property_title: string;
  property_slug: string;
  property_city: string;
  property_state: string;
  property_price: string;
  property_currency: string;
  cover_image: string | null;
  created_at: string;
};

export type UseUserBookmarkReturn = {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
      const response = await api.get('/api/market/bookmarks/');
      setBookmarks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
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
    setLoading,

    refetch: fetchBookmarks,
  };
}
