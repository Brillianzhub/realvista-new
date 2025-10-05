const currencySymbols: Record<string, string> = {
    NGN: "₦",
    GHS: "₵",
    USD: "$",
    GBP: "£",
    EUR: "€",
    JPY: "¥",
    ZAR: "R",
    ZMW: "K",

    // Add more symbols as needed
};

export const formatCurrency = (
    amount: number,
    currency: string
): string => {
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
    }).format(amount)}`;
};
