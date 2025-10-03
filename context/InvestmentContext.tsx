import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import { useGlobalContext } from "../context/GlobalProvider";

// Define investment & order types (customize with real API shape)
type Investment = {
    id: string | number;
    amount: number;
    type: string;
    [key: string]: any;
};

type Order = {
    id: string | number;
    status: string;
    [key: string]: any;
};

type InvestmentContextType = {
    investment: Investment[];
    setInvestment: Dispatch<SetStateAction<Investment[]>>;
    // You can expose orders if you plan to use them later
    orders: Order[];
    setOrders: Dispatch<SetStateAction<Order[]>>;
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(
    undefined
);

export const useInvestmentData = (): InvestmentContextType => {
    const context = useContext(InvestmentContext);
    if (!context) {
        throw new Error(
            "useInvestmentData must be used within an InvestmentProvider"
        );
    }
    return context;
};

type InvestmentProviderProps = {
    children: ReactNode;
};

export const InvestmentProvider: React.FC<InvestmentProviderProps> = ({
    children,
}) => {
    const { user } = useGlobalContext();
    const [investment, setInvestment] = useState<Investment[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    return (
        <InvestmentContext.Provider
            value={{ investment, setInvestment, orders, setOrders }}
        >
            {children}
        </InvestmentContext.Provider>
    );
};
