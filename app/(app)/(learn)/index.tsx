import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import VideoCard from '@/components/learn/VideoCard';
import { useLearnVideos, LearnVideo } from '@/hooks/learn/useLearnVideos';
import { useTheme } from '@/context/ThemeContext';

const BRAND = '#358B8B';
const ACCENT = '#efa968';

type Category = 'All' | 'Real Estate' | 'Finance' | 'Investment';

const categories: Category[] = ['All', 'Real Estate', 'Finance', 'Investment'];

export default function Learn() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { colors } = useTheme();
  const router = useRouter();

  const { videos, loading, error, refetch } = useLearnVideos(); // fetch all
  const [filteredContents, setFilteredContents] = useState<LearnVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    filterContent();
  }, [videos, selectedCategory, searchQuery]);

  const filterContent = () => {
    let filtered = videos;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    }

    setFilteredContents(filtered);
  };

  const toggleWatchedStatus = async (contentId: string) => {
    const isWatched = watchedVideos.has(contentId);

    try {
      let newWatchedSet: Set<string>;

      if (isWatched) {
        newWatchedSet = new Set(watchedVideos);
        newWatchedSet.delete(contentId);
      } else {
        newWatchedSet = new Set(watchedVideos);
        newWatchedSet.add(contentId);
      }

      setWatchedVideos(newWatchedSet);

      await AsyncStorage.setItem(
        'watchedVideos',
        JSON.stringify(Array.from(newWatchedSet)),
      );
    } catch (error) {
      console.error('Error toggling watched status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleVideoPress = (item: LearnVideo) => {
    router.push({
      pathname: '/(app)/(learn)/[slug]',
      params: { slug: String(item.slug) },
    });
  };

  const renderCategoryPill = (category: Category) => {
    const isSelected = category === selectedCategory;
    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryPill,
          isSelected && styles.categoryPillActive,
          isDark && !isSelected && styles.categoryPillDark,
        ]}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryPillText,
            isSelected && styles.categoryPillTextActive,
            isDark && !isSelected && styles.categoryPillTextDark,
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="videocam-outline"
        size={64}
        color={isDark ? '#4B5563' : '#D1D5DB'}
      />
      <Text
        style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}
      >
        No videos found
      </Text>
      <Text
        style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}
      >
        {searchQuery
          ? 'Try adjusting your search or filter'
          : 'Check back soon for new educational content'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View
        style={[styles.header, { backgroundColor: colors.background.primary }]}
      >
        <View style={styles.accentBar} />

        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
          Master real estate, finance, and investment
        </Text>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statPill,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <View style={[styles.statDot, { backgroundColor: ACCENT }]} />
            <Text
              style={[styles.statPillText, { color: colors.text.secondary }]}
            >
              {filteredContents.length} videos
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <View style={[styles.statDot, { backgroundColor: ACCENT }]} />
            <Text
              style={[styles.statPillText, { color: colors.text.secondary }]}
            >
              {selectedCategory}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => renderCategoryPill(item)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FB902E" />
          </View>
        ) : (
          <FlatList
            data={filteredContents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <VideoCard
                id={item.id}
                title={item.title}
                description={item.description}
                category={item.category}
                thumbnailUrl={item.thumbnail_url}
                duration={item.duration}
                isWatched={watchedVideos.has(item.id)}
                onPress={() => handleVideoPress(item)}
                onToggleWatched={() => toggleWatchedStatus(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FB902E"
                colors={['#FB902E']}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  accentBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0D2626',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerTitleDark: {
    color: '#E8F5F5',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  searchContainerDark: {
    backgroundColor: '#1F2937',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  searchInputDark: {
    color: '#F9FAFB',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryPillDark: {
    backgroundColor: '#1F2937',
  },
  categoryPillActive: {
    backgroundColor: '#FB902E',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryPillTextDark: {
    color: '#9CA3AF',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateTitleDark: {
    color: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateTextDark: {
    color: '#9CA3AF',
  },
});
