import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import useFetchProperties from '@/hooks/market/useFetchProperties';
import { formatCurrency } from '@/utils/general/formatCurrency';
import { useTheme } from '@/context/ThemeContext';
import MarketPropertyList from '@/components/market/MarketPropertyList';
// import SearchFilterModal from '@/components/Market/SearchFilterModal';
// import SearchBarComponent from '@/screens/Market/SearchBarComponent';

// Define property type if you know your API response structure
interface Property {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  price: number;
  currency: string;
  property_type: string;
  listing_purpose: string;
  bedrooms?: number;
  listed_date?: string;
  image_files?: { file?: string; image_url?: string }[];
}

interface Filters {
  description: string;
  city: string;
  state: string;
  minPrice: number | null;
  maxPrice: number | null;
  generalSearch: string;
}

const MarketScreen: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { properties, fetchProperties, loading, error, applyFilters } = useFetchProperties();

  const [filters, setFilters] = useState<Filters>({
    description: '',
    city: '',
    state: '',
    minPrice: null,
    maxPrice: null,
    generalSearch: '',
  });

  const { colors } = useTheme();

  const onRefresh = async () => {
    setRefreshing(true);

    const defaultFilters: Filters = {
      description: '',
      city: '',
      state: '',
      minPrice: null,
      maxPrice: null,
      generalSearch: '',
    };

    setFilters(defaultFilters);
    applyFilters(defaultFilters);
    await fetchProperties();
    setRefreshing(false);
  };

  const updateSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, generalSearch: query }));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#358B8B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProperties} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <SearchBarComponent
        searchQuery={filters.generalSearch}
        setSearchQuery={updateSearchQuery}
        onFilterPress={() => setIsModalVisible(true)}
        onApplyFilters={applyFilters}
      /> */}

      <FlatList<Property>
        data={properties as any[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MarketPropertyList properties={[item]} formatCurrency={formatCurrency} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#358B8B']}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No properties found. Try adjusting your filters.</Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* <SearchFilterModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
      /> */}
    </View>
  );
};

export default MarketScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 50,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#358B8B',
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FB902E',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: '#358B8B',
    width: 50,
    height: 5,
    borderRadius: 3,
  },
  handleContainer: {
    backgroundColor: '#358B8B1A',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
