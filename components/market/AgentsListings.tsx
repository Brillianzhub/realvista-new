import React from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import MarketPropertyList from '@/components/market/MarketPropertyList';
import { useAgentListings } from '@/hooks/market/useAgentListings';
import { useTheme } from '@/context/ThemeContext';

const AgentsListings = () => {
  const { properties, loading, error, loadMore, hasMore, refresh, refreshing } =
    useAgentListings();

  const { colors } = useTheme();

  const corporateProperties = properties.filter(
    (property) => property.category === 'corporate'
  );

  if (loading && corporateProperties.length === 0) {
    return (
      <ActivityIndicator
        size="large"
        style={{
          backgroundColor: colors.background.primary,
          flex: 1,
        }}
      />
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background.primary },
        ]}
      >
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <MarketPropertyList properties={corporateProperties as any} />

      {/* Load More Button */}
      {hasMore && !loading && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}

      {loading && properties.length > 0 && (
        <ActivityIndicator size="small" style={{ marginVertical: 12 }} />
      )}
    </ScrollView>
  );
};

export default AgentsListings;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: 'rgba(53,139,139,1)',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
