import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCurrency } from "@/context/CurrencyContext";

// ---- Types ----

// API response structure (adjust fields if backend returns more)
interface Summary {
    total_initial_cost: number;
    total_current_value: number;
    net_cash_flow: number;
    total_income: number;
    total_expenses: number;
}

export interface PortfolioData {
    group_summary?: Summary;
    personal_summary?: Summary;
    overall_summary?: Summary;
}

// Calculated metrics type
interface Metrics {
    totalInitialCost: number;
    totalCurrentValue: number;
    netAppreciation: number;
    totalValue: number;
    averageAppreciationPercentage: number;
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    roi: number;
}

export interface PortfolioResult {
    group_summary?: Metrics;
    personal_summary?: Metrics;
    overall_summary?: Metrics;
}

// Hook return type
interface UsePortfolioDetailReturn {
    result: PortfolioResult | null;
    portfolioData: PortfolioData | null;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    currency: string;
    fetchPortfolioDetails: () => Promise<void>;
}

// ---- Hook ----

const usePortfolioDetail = (): UsePortfolioDetailReturn => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [result, setResult] = useState<PortfolioResult | null>(null);
    const { currency } = useCurrency();

    const fetchPortfolioDetails = async (): Promise<void> => {
        if (!refreshing) setLoading(true);
        try {
            const token = await AsyncStorage.getItem("authToken");

            if (!token) {
                console.log("This operation requires verified user!");
                return;
            }

            const response = await axios.get<PortfolioData>(
                `https://www.realvistamanagement.com/portfolio/portfolio-analysis/?currency=${currency}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setPortfolioData(response.data);
        } catch (error: any) {
            console.error("Error fetching user properties:", error.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    function calculateMetrics(data: PortfolioData): PortfolioResult {
        if (!data) {
            throw new Error("Input data is missing.");
        }

        const categories: (keyof PortfolioData)[] = ["group_summary", "personal_summary", "overall_summary"];
        const results: PortfolioResult = {};

        categories.forEach((category) => {
            const summary = data[category];

            if (!summary) {
                return;
            }

            const {
                total_initial_cost,
                total_current_value,
                net_cash_flow,
                total_income,
                total_expenses,
            } = summary;

            const netAppreciation = total_current_value - total_initial_cost;
            const totalValue = total_current_value + total_income - total_expenses;
            const averageAppreciationPercentage =
                (netAppreciation / total_initial_cost) * 100;
            const roi =
                ((netAppreciation + net_cash_flow) /
                    (total_initial_cost + total_expenses)) *
                100;

            results[category] = {
                totalInitialCost: total_initial_cost,
                totalCurrentValue: total_current_value,
                netAppreciation,
                totalValue,
                averageAppreciationPercentage: parseFloat(
                    averageAppreciationPercentage.toFixed(2)
                ),
                totalIncome: total_income,
                totalExpenses: total_expenses,
                netCashFlow: net_cash_flow,
                roi: parseFloat(roi.toFixed(2)),
            };
        });

        return results;
    }

    useEffect(() => {
        if (portfolioData) {
            const calculatedResults = calculateMetrics(portfolioData);
            setResult(calculatedResults);
        }
    }, [portfolioData]);

    useEffect(() => {
        fetchPortfolioDetails();
    }, []);

    return { result, portfolioData, loading, setLoading, currency, fetchPortfolioDetails };
};

export default usePortfolioDetail;
