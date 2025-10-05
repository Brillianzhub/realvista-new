import React from "react";
import MarketPropertyList from "@/components/market/MarketPropertyList";
import { Listing } from "@/hooks/market/useAgentListings";


const p2pProperties: Listing[] = [

];

const P2PListings = () => {
    return <MarketPropertyList properties={p2pProperties} />;
};

export default P2PListings;
