import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import PostCard from '@/components/trends/PostCard';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

import useTrends from '@/hooks/trends/useTrends';

const BRAND = '#358B8B';
const ACCENT = '#efa968';

export default function Trends() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const { colors } = useTheme();

  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    onRefresh,
    refetch,
    loadMore,
    incrementViews,
  } = useTrends();

  const extractExcerpt = (html: string): string => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const handlePostPress = (slug: string) => {
    router.push({ pathname: '/(app)/(trends)/[slug]', params: { slug } });
    incrementViews(slug);
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  const SkeletonPulse = ({ style }: { style: any }) => (
    <View
      style={[
        { backgroundColor: isDark ? '#1E2D2D' : '#E8F0F0', borderRadius: 6 },
        style,
      ]}
    />
  );

  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[styles.skeletonCard, isDark && styles.skeletonCardDark]}
        >
          <SkeletonPulse
            style={{ width: '100%', height: 180, borderRadius: 0 }}
          />
          <View style={{ padding: 16, gap: 10 }}>
            <SkeletonPulse
              style={{ width: 80, height: 22, borderRadius: 20 }}
            />
            <SkeletonPulse style={{ width: '90%', height: 18 }} />
            <SkeletonPulse style={{ width: '70%', height: 18 }} />
            <SkeletonPulse style={{ width: '55%', height: 14, marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );

  // ── Empty / Error states ───────────────────────────────────────────────────
  const renderEmptyState = () => (
    <View style={styles.centeredState}>
      <View
        style={[
          styles.stateIconRing,
          { borderColor: isDark ? '#1E3A3A' : '#D0E9E9' },
        ]}
      >
        <Ionicons name="newspaper-outline" size={32} color={BRAND} />
      </View>
      <Text style={[styles.stateTitle, isDark && styles.stateTitleDark]}>
        Nothing here yet
      </Text>
      <Text style={[styles.stateBody, isDark && styles.stateBodyDark]}>
        Check back soon for the latest market insights and trends.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centeredState}>
      <View
        style={[
          styles.stateIconRing,
          { borderColor: isDark ? '#3B1F1F' : '#FDDCDC' },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={32} color="#E24B4A" />
      </View>
      <Text style={[styles.stateTitle, isDark && styles.stateTitleDark]}>
        Something went wrong
      </Text>
      <Text style={[styles.stateBody, isDark && styles.stateBodyDark]}>
        {error}
      </Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={refetch}
        activeOpacity={0.8}
      >
        <Text style={styles.retryBtnText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Header (inline, not inside gradient anymore) ───────────────────────────
  const ListHeader = () => (
    <View
      style={[
        styles.listHeader,
        { backgroundColor: colors.background.primary },
      ]}
    >
      {/* Accent bar */}
      <View style={styles.accentBar} />
      <Text style={[styles.pageTitle, isDark && styles.pageTitleDark]}>
        Market Trends
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.text.secondary }]}>
        Latest real estate insights, curated for you
      </Text>

      {/* Stats pill row */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statPill,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <View style={[styles.statDot, { backgroundColor: ACCENT }]} />
          <Text style={[styles.statPillText, { color: colors.text.secondary }]}>
            {posts.length} reports
          </Text>
        </View>
        <View
          style={[
            styles.statPill,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <View style={[styles.statDot, { backgroundColor: ACCENT }]} />
          <Text style={[styles.statPillText, { color: colors.text.secondary }]}>
            Updated today
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Root ───────────────────────────────────────────────────────────────────
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {loading ? (
        <>
          <ListHeader />
          {renderSkeleton()}
        </>
      ) : error ? (
        <>
          <ListHeader />
          {renderErrorState()}
        </>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              id={item.id.toString()}
              title={item.title}
              excerpt={extractExcerpt(item.body)}
              thumbnail={item.attachment || undefined}
              publishedDate={item.date_created}
              category={item.category}
              onPress={() => handlePostPress(item.slug)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<ListHeader />}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BRAND}
              colors={[BRAND]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: isDark ? '#1A2E2E' : '#EBF4F4',
                marginHorizontal: 20,
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
  },

  // ── List header block ─────────────────────────────────────────────────────
  listHeader: {
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
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0D2626',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  pageTitleDark: {
    color: '#E8F5F5',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#5A8A8A',
    lineHeight: 20,
    marginBottom: 18,
  },
  pageSubtitleDark: {
    color: '#6AABAB',
  },

  // ── Stats pills ───────────────────────────────────────────────────────────
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
    color: '#2A6F6F',
  },
  statPillTextDark: {
    color: '#7ABFBF',
  },

  // ── FlatList content ──────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 32,
  },

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#DAEEF0',
  },
  skeletonCardDark: {
    backgroundColor: '#112626',
    borderColor: '#1A3333',
  },

  // ── Empty / Error ─────────────────────────────────────────────────────────
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
    paddingHorizontal: 36,
  },
  stateIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  stateTitleDark: {
    color: '#E8F5F5',
  },
  stateBody: {
    fontSize: 14,
    color: '#5A8A8A',
    textAlign: 'center',
    lineHeight: 21,
  },
  stateBodyDark: {
    color: '#6AABAB',
  },
  retryBtn: {
    marginTop: 22,
    backgroundColor: BRAND,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 28,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
