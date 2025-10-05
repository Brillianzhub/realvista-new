import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import MarketHeader from "@/components/market/MarketHeader";
import AgentsListings from "@/components/market/AgentsListings";
import P2PListings from "@/components/market/P2PListings";

export default function MarketScreen() {
  const [marketType, setMarketType] = useState<"traditional" | "p2p">("traditional");

  return (
    <View style={styles.container}>
      {/* Header */}
      <MarketHeader marketType={marketType} setMarketType={setMarketType} />

      {/* Conditional content */}
      <View style={styles.content}>
        {marketType === "traditional" ? <AgentsListings /> : <P2PListings />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
});
