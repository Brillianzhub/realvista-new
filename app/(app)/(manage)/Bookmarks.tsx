import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Button,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback } from 'react';
import api from '@/lib/apiClient';
import useUserBookmarks, { type Bookmark } from '@/hooks/market/useUserBookmark';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/general/formatCurrency';

const Bookmarks: React.FC = () => {
  const { bookmarks, loading, setLoading, error, refetch } = useUserBookmarks();
  const router = useRouter();

  const capitalizeEachWord = (str: string): string => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleReload = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const removeBookmark = async (slug: string): Promise<void> => {
    try {
      const response = await api.post(
        `/api/market/${slug}/bookmark/`,
        {},
      );

      if (response.status === 200 || response.status === 201) {
        handleReload();
      } else {
        console.error('Failed to update bookmark');
      }
    } catch (error: any) {
      console.error(
        'An error occurred:',
        error.response?.data || error.message,
      );
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
        <Text style={styles.emptyText}>
          No item found in your favorite collections.
        </Text>
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
      data={bookmarks}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }: { item: Bookmark }) => (
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(app)/(tabs)/market/marketdetails',
                params: { slug: item.property_slug },
              })
            }
            style={styles.card}
          >
            <Text style={styles.title}>{item.property_title}</Text>
            <Text style={styles.address}>
              {capitalizeEachWord(item.property_city)},{' '}
              {capitalizeEachWord(item.property_state)} State.
            </Text>
            <Text style={styles.price}>
              {formatCurrency(Number(item.property_price), item.property_currency)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeBookmark(item.property_slug)}
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
    marginVertical: 8,
  },
});
