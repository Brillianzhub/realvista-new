import { StyleSheet, Text, View, ActivityIndicator, FlatList, Button, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import axios from 'axios';
import useUserBookmarks from '@/hooks/market/useUserBookmark';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '@/utils/general/formatCurrency';

// Define the bookmark item type
interface Bookmark {
    bookmark_id: number;
    property_id: number;
    title: string;
    address: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    property_type: string;
    listing_purpose: string;
}

const Bookmarks: React.FC = () => {
    const { bookmarks, loading, setLoading, error, fetchBookmarks } = useUserBookmarks();
    const router = useRouter();

    const capitalizeEachWord = (str: string): string => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleReload = useCallback(() => {
        setLoading(true);
        fetchBookmarks();
    }, [fetchBookmarks, setLoading]);

    const removeBookmark = async (bookmarkId: number): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await axios.post(
                `https://realvistamanagement.com/market/remove-bookmark/${bookmarkId}/`,
                {},
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                handleReload();
            } else {
                console.error(response.data.message || 'Failed to delete bookmark');
            }
        } catch (error: any) {
            console.error('An error occurred:', error.response?.data || error.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#358B8B" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Button title="Retry" onPress={handleReload} color="#358B8B" />
            </View>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>No item found in your favorite collections.</Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#FB902E',
                        padding: 10,
                        marginTop: 10,
                        borderRadius: 10,
                        width: '30%',
                        alignItems: 'center',
                    }}
                    onPress={handleReload}
                >
                    <Text style={{ color: 'white' }}>Reload</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <FlatList
            data={bookmarks as Bookmark[]}
            keyExtractor={(item) => item.bookmark_id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }: { item: Bookmark }) => (
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: '/(app)/(tabs)/market/marketdetails',
                                params: { selectedItemId: JSON.stringify(item.property_id) },
                            })
                        }
                        style={styles.card}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.address}>
                            {capitalizeEachWord(item.address)}, {capitalizeEachWord(item.city)}, {capitalizeEachWord(item.state)} State.
                        </Text>
                        <Text style={styles.price}>
                            {formatCurrency(item.price, item.currency)}
                        </Text>
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailText}>
                                {item.property_type.charAt(0).toUpperCase() + item.property_type.slice(1)}
                            </Text>
                            <Text style={styles.detailText}>
                                Listed for {item.listing_purpose.charAt(0).toUpperCase() + item.listing_purpose.slice(1)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => removeBookmark(item.bookmark_id)}
                        style={styles.removeButton}
                    >
                        <Ionicons name="close-circle-outline" size={24} color="gray" />
                    </TouchableOpacity>
                </View>
            )}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={handleReload}
                    colors={['#358B8B']}
                />
            }
        />
    );
};


export default Bookmarks;

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#6c757d',
        fontSize: 16,
        fontStyle: 'italic',
    },
    listContainer: {
        padding: 10,
    },
    card: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#343a40',
    },
    address: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 5,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },

    detailText: {
        fontSize: 13,
        color: '#777',
    },
    removeButton: {
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#358B8B',
        marginVertical: 8
    }
});
