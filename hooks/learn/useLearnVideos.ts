import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/apiClient';

export interface LearnVideo {
    youtube_id: any;
    id: string;
    title: string;
    description: string;
    category: string;
    youtube_url: string;
    thumbnail_url: string;
    duration: string;
    created_at: string;
    view_count: number;
    slug: string;
}

interface UseLearnVideosOptions {
    category?: string;
    search?: string;
    ordering?: string;
}

export function useLearnVideos(options: UseLearnVideosOptions = {}) {
    const [videos, setVideos] = useState<LearnVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();

            if (options.category) params.append('category', options.category);
            if (options.search) params.append('search', options.search);
            if (options.ordering) params.append('ordering', options.ordering);

            const response = await api.get(
                `/api/learn/?${params.toString()}`
            );

            setVideos(response.data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong while fetching videos.');
        } finally {
            setLoading(false);
        }
    }, [options.category, options.search, options.ordering]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    return { videos, loading, error, refetch: fetchVideos };
}
