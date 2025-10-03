import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            const response = await axios.get<Target[]>(
                "https://www.realvistamanagement.com/analyser/financial-targets/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
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
        fetchTargets();
    }, []);

    return (
        <TargetContext.Provider
            value={{ targets, loading, refreshing, handleRefresh }}
        >
            {children}
        </TargetContext.Provider>
    );
};
