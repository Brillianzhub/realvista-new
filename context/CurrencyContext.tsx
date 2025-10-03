import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CurrencyContextType = {
    currency: string;
    setCurrency: (newCurrency: string) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
    undefined
);

type CurrencyProviderProps = {
    children: ReactNode;
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
    children,
}) => {
    const [currency, setCurrency] = useState<string>("NGN");

    useEffect(() => {
        const loadCurrency = async () => {
            try {
                const storedCurrency = await AsyncStorage.getItem("defaultCurrency");
                if (storedCurrency) {
                    setCurrency(storedCurrency);
                }
            } catch (error) {
                console.error("Failed to load currency from storage:", error);
            }
        };
        loadCurrency();
    }, []);

    const updateCurrency = async (newCurrency: string) => {
        try {
            setCurrency(newCurrency);
            await AsyncStorage.setItem("defaultCurrency", newCurrency);
        } catch (error) {
            console.error("Failed to save currency to storage:", error);
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
