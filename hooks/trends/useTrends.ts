import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

export type TrendPost = {
  id: number;
  title: string;
  slug: string;
  body: string;
  attachment: string | null;
  date_created: string;
  category: string;
  views: number;
  publish: boolean;
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TrendPost[];
};

export default function useTrends() {
  const [posts, setPosts] = useState<TrendPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // ---------------- INITIAL FETCH ----------------
  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiClient.get<ApiResponse>('/api/trends/reports/');

      setPosts(response.data.results || []);
      setNextUrl(response.data.next);
    } catch (err: any) {
      setError(
        err?.readableMessage || 'Failed to load trends. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ---------------- LOAD MORE ----------------
  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;

    try {
      setLoadingMore(true);

      // IMPORTANT: nextUrl is full URL, so use axios directly
      const response = await apiClient.get<ApiResponse>(nextUrl);

      setPosts((prev) => [...prev, ...(response.data.results || [])]);
      setNextUrl(response.data.next);
    } catch (err) {
      // optional: silent fail
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  // ---------------- REFRESH ----------------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  // ---------------- VIEW COUNT ----------------
  const incrementViews = useCallback(async (slug: string) => {
    try {
      await apiClient.post(`/api/trends/reports/${slug}/increment-views/`);
    } catch {
      // silent fail
    }
  }, []);

  // ---------------- INIT ----------------
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    refetch: fetchPosts,
    onRefresh,
    loadMore,
    incrementViews,
    hasNext: !!nextUrl,
  };
}
