
export interface MarketProperty {
    id: string;
    name: string;
    images: string[];
    value: number;
    roi: number;
    description: string;
    state: string;
    city: string;
    country: string;
    units: number;
    type: string;
    amenities: string[];
    yearBought: number;
    latitude: number;
    longitude: number;
    owner: {
        name: string;
        avatar: string;
        joined: string;
        verified: boolean;
        email: string;
    };
    performanceData: {
        labels: string[];
        datasets: Array<{ data: number[] }>;
    };
}