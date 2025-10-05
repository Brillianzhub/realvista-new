import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

interface DetailsComponentProps {
    bedrooms?: number | null;
    bathrooms?: number | null;
    lot_size?: number | null;
    square_feet?: number | null;
    availability?: string | null;
    availability_date?: string | null;
    year_built?: number | string | null;
}

interface DetailItem {
    icon: ReactNode;
    label: string;
    value: string | number | null;
}

const DetailsComponent: React.FC<DetailsComponentProps> = ({
    bedrooms,
    bathrooms,
    lot_size,
    square_feet,
    availability,
    availability_date,
    year_built,
}) => {
    const detailItems: DetailItem[] = [];

    const addItem = (icon: ReactNode, label: string, value: string | number | null | undefined) => {
        if (value !== null && value !== undefined) {
            detailItems.push({ icon, label, value });
        }
    };

    addItem(<MaterialIcons name="bed" size={20} color="#3498db" />, "Bedrooms", bedrooms);
    addItem(<FontAwesome5 name="bath" size={20} color="#e74c3c" />, "Bathrooms", bathrooms);
    addItem(
        <Ionicons name="resize" size={20} color="#2ecc71" />,
        "Plot Size",
        lot_size ? `${lot_size} sq.m.` : null
    );
    addItem(
        <FontAwesome5 name="ruler-combined" size={20} color="#9b59b6" />,
        "Area",
        square_feet ? `${square_feet} sq.m.` : null
    );
    addItem(
        <MaterialIcons name="date-range" size={20} color="#f1c40f" />,
        "Availability",
        availability === "date" ? availability_date : availability
    );
    addItem(<FontAwesome5 name="building" size={20} color="#e67e22" />, "Year Built", year_built);

    const renderItems = () => {
        const rows: ReactNode[] = [];
        let row: ReactNode[] = [];

        detailItems.forEach((item, index) => {
            row.push(
                <View key={index} style={styles.detailItem}>
                    {item.icon}
                    <View style={styles.textWrapper}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                </View>
            );

            if (row.length === 3 || index === detailItems.length - 1) {
                rows.push(
                    <View key={`row-${index}`} style={styles.rowWrapper}>
                        {row}
                    </View>
                );
                row = [];
            }
        });
        return rows;
    };

    return <View style={styles.container}>{renderItems()}</View>;
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    rowWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    detailItem: {
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 10,
        flex: 1,
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    textWrapper: {
        alignItems: "center",
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    value: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
});

export default DetailsComponent;
