import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import { hydrateUser, type HydratedUser } from "@/lib/userHydration";
import { tokenStore } from "@/lib/tokenStore";

export type User = HydratedUser;

type GlobalContextType = {
    isLogged: boolean;
    setIsLogged: Dispatch<SetStateAction<boolean>>;
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    fetchGroups: () => Promise<void>;
    reloadProfile: () => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

type GlobalProviderProps = {
    children: ReactNode;
};

const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const token = await tokenStore.get();
            if (!token) {
                setIsLogged(false);
                setUser(null);
                return;
            }

            const res = await hydrateUser();
            if (res) {
                setIsLogged(true);
                setUser(res);
            } else {
                setIsLogged(false);
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const reloadProfile = () => {
        fetchGroups();
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                user,
                setUser,
                loading,
                setLoading,
                fetchGroups,
                reloadProfile,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
