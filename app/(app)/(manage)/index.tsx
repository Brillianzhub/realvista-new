import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ImageSourcePropType, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import images from '@/constants/images';

interface ActionItem {
    id: string;
    label: string;
    icon: ImageSourcePropType;
    onPress: () => void;
}

const ManageProperty: React.FC = () => {
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const actions: ActionItem[] = [
        { id: '1', label: 'Add Property', icon: images.add, onPress: () => router.push('/(app)/(manage)/add-property') },
        { id: '2', label: 'Add Income', icon: images.income, onPress: () => router.push('/(app)/(manage)/add-property-income') },
        { id: '3', label: 'Add Expenses', icon: images.expense, onPress: () => router.push('/(app)/(manage)/add-property-expenses') },
        { id: '4', label: 'Remove Property', icon: images.remove, onPress: () => router.push('/(app)/(manage)/remove-property') },
        { id: '5', label: 'Update Property', icon: images.update, onPress: () => router.push('/(app)/(manage)/update-property') },
        // { id: '6', label: 'List to the Market', icon: images.sale, onPress: () => router.replace('/(marketlisting)/MarketListing') },
        { id: '7', label: 'Add Coordinates', icon: images.coordinate, onPress: () => router.push('/(app)/(manage)/add-coordinates') },
        { id: '8', label: 'Add Files/Images', icon: images.addfile, onPress: () => router.push('/(app)/(manage)/add-files') },
    ];

    const renderAction = ({ item }: { item: ActionItem }) => (
        <TouchableOpacity style={styles.box} onPress={item.onPress}>
            <Image source={item.icon} style={styles.iconStyle} />
            <Text style={styles.boxText}>{item.label}</Text>
        </TouchableOpacity>
    );

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={actions}
                keyExtractor={(item) => item.id}
                renderItem={renderAction}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                bounces
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
        </View>
    );
};

export default ManageProperty

const { width: screenWidth } = Dimensions.get('window');

const dynamicFontSize = screenWidth < 380 ? 12 : 14;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#FFFFFF',
    },
    grid: {
        justifyContent: 'space-between',
    },
    row: {
        justifyContent: 'space-between',
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        width: '48%',
        paddingLeft: 15,
        backgroundColor: '#358B8B0D',
        borderRadius: 15,
        margin: 5,
        gap: 5
    },
    boxText: {
        flex: 1,
        color: '#358B8B',
        fontSize: dynamicFontSize,
        textAlign: 'left',
    },
    iconStyle: {
        height: 24,
        width: 24,
    },
});
