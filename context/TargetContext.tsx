import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import api from "@/lib/apiClient";
import { tokenStore } from '@/lib/tokenStore';

// Define the shape of a Target (based on your API response)
export interface Target {
    id: number;
    name: string;
    amount: number;
    achieved: boolean;
    // ✅ Add more fields from your backend if needed
}

// Define context type
interface TargetContextType {
    targets: Target[];
    loading: boolean;
    refreshing: boolean;
    handleRefresh: () => Promise<void>;
}

// Create context with proper typing
const TargetContext = createContext<TargetContextType | undefined>(undefined);

// Hook to consume context
export const useTargetContext = (): TargetContextType => {
    const context = useContext(TargetContext);
    if (!context) {
        throw new Error("useTargetContext must be used within a TargetProvider");
    }
    return context;
};

// Props type for Provider
interface TargetProviderProps {
    children: ReactNode;
}

export const TargetProvider: React.FC<TargetProviderProps> = ({ children }) => {
    const [targets, setTargets] = useState<Target[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchTargets = async () => {
        setLoading(true);
        try {
            const response = await api.get<Target[]>(
                "/api/analyser/financial-targets/"
            );

            setTargets(response.data);
        } catch (error: any) {
            console.error(
                "Error fetching financial targets:",
                error.response ? error.response.data : error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTargets();
        setRefreshing(false);
    };

    useEffect(() => {
        const run = async () => {
            const token = await tokenStore.get();
            if (!token) return;
            fetchTargets();
        };
        run();
    }, []);

    return (
        <TargetContext.Provider
            value={{ targets, loading, refreshing, handleRefresh }}
        >
            {children}
        </TargetContext.Provider>
    );
};
