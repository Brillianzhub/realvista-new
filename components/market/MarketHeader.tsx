import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ListFilterPlus } from "lucide-react-native";

interface MarketHeaderProps {
    marketType: "traditional" | "p2p";
    setMarketType: (type: "traditional" | "p2p") => void;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ marketType, setMarketType }) => {
    const router = useRouter();

    const handleOpenFilter = () => {
        router.push("/(app)/(tabs)/market/search");
    };

    return (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>
                    {marketType === "traditional" ? "Market" : "P2P Market"}
                </Text>

                <TouchableOpacity onPress={handleOpenFilter} style={styles.filterButton}>
                    <ListFilterPlus size={22} color="#333" />
                </TouchableOpacity>
            </View>

            <Text style={styles.headerSubtitle}>
                {marketType === "traditional"
                    ? "Browse properties from agents and coporate sellers"
                    : "Browse properties for sale by peers without agent fees"}
            </Text>

            {/* Market type selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, marketType === "traditional" && styles.activeTab]}
                    onPress={() => setMarketType("traditional")}
                >
                    <Text style={[styles.tabButtonText, marketType === "traditional" && styles.activeTabText]}>Coporate Listings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, marketType === "p2p" && styles.activeTab]}
                    onPress={() => setMarketType("p2p")}
                >
                    <Text style={[styles.tabButtonText, marketType === "p2p" && styles.activeTabText]} >P2P</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MarketHeader;

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
        paddingBottom: 0,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    filterButton: {
        padding: 6,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 15,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: '#358B8B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    activeTabText: {
        color: '#fff',
    },
});
