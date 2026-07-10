import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '@/lib/apiClient';
import { useTheme } from '@/context/ThemeContext';

const TEAL = '#358B8B';

// ── Types ─────────────────────────────────────────────────────────────────────
// Matches NotificationSerializer / NotificationListView exactly
// (GET /api/notifications/).

type NotificationType =
  | 'appointment'
  | 'listing'
  | 'subscription'
  | 'referral'
  | 'payment'
  | 'system';

type NotificationItem = {
  id: number;
  type: NotificationType;
  type_display: string;
  title: string;
  body: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type NotificationResponse = {
  count: number;
  unread_count: number;
  page: number;
  pages: number;
  results: NotificationItem[];
};

type FilterKey = 'all' | 'unread' | NotificationType;

// ── Config ────────────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'listing', label: 'Listings' },
  { key: 'subscription', label: 'Subscriptions' },
  { key: 'referral', label: 'Referrals' },
  { key: 'payment', label: 'Payments' },
  { key: 'system', label: 'System' },
];

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  appointment: 'calendar-outline',
  listing: 'business-outline',
  subscription: 'card-outline',
  referral: 'gift-outline',
  payment: 'wallet-outline',
  system: 'notifications-outline',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function emptyMessage(filter: FilterKey): string {
  if (filter === 'unread') return "You're all caught up!";
  if (filter !== 'all') {
    const label = FILTERS.find((f) => f.key === filter)?.label ?? filter;
    return `No ${label.toLowerCase()} notifications`;
  }
  return 'Activity from appointments, listings, and payments will appear here.';
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const buildParams = useCallback(
    (pageNum: number) => {
      const params: Record<string, string | number> = { page: pageNum };
      if (filter === 'unread') params.unread = 'true';
      else if (filter !== 'all') params.type = filter;
      return params;
    },
    [filter],
  );

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(false);
      }
      try {
        const { data } = await api.get<NotificationResponse>(
          '/api/notifications/',
          { params: buildParams(pageNum) },
        );
        setNotifications((prev) =>
          append ? [...prev, ...data.results] : data.results,
        );
        setUnreadCount(data.unread_count);
        setPage(data.page);
        setPages(data.pages);
      } catch (e) {
        console.error('[Notifications] load failed', e);
        if (!append) setError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    load(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    load(1, false);
  };

  const handleLoadMore = () => {
    if (page < pages && !loadingMore) load(page + 1, true);
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await api.post('/api/notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      Alert.alert('Error', 'Failed to mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handlePress = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        const { data } = await api.post<NotificationItem>(
          `/api/notifications/${item.id}/read/`,
        );
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? data : n)),
        );
        setUnreadCount((c) => Math.max(c - 1, 0));
      } catch {
        // Non-fatal — still allow navigation below.
      }
    }

    if (item.data?.listing_slug) {
      router.push({
        pathname: '/(app)/(tabs)/market/marketdetails',
        params: { slug: item.data.listing_slug },
      });
    } else if (item.data?.appointment_id) {
      // No appointments screen exists in the mobile app yet (web-only
      // today, at /dashboard/appointments) — surface this instead of
      // pushing to a route that doesn't exist.
      Alert.alert('Coming Soon', 'Appointments are not yet available in the app.');
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      onPress={() => handlePress(item)}
      style={[
        styles.row,
        {
          backgroundColor: item.is_read
            ? colors.background.primary
            : colors.background.secondary,
          borderColor: colors.border.default,
          borderLeftColor: item.is_read ? 'transparent' : TEAL,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${TEAL}20` }]}>
        <Ionicons name={TYPE_ICON[item.type] ?? 'notifications-outline'} size={20} color={TEAL} />
      </View>

      <View style={styles.rowContent}>
        <Text
          style={[
            styles.title,
            { color: colors.text.primary },
            !item.is_read && styles.titleUnread,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.body, { color: colors.text.secondary }]}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={[styles.time, { color: colors.text.muted }]}>
          {timeAgo(item.created_at)}
        </Text>
      </View>

      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSub, { color: colors.text.secondary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={notifications.length === 0 || markingAll}
          style={styles.markAllBtn}
        >
          {markingAll ? (
            <ActivityIndicator size="small" color={TEAL} />
          ) : (
            <Ionicons
              name="checkmark-done"
              size={20}
              color={notifications.length === 0 ? colors.text.muted : TEAL}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: f }) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterPill,
                { backgroundColor: active ? TEAL : colors.background.secondary },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: active ? '#FFFFFF' : colors.text.secondary },
                ]}
              >
                {f.label}
                {f.key === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Body */}
      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : error ? (
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
          <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
            Could not load notifications.
          </Text>
          <TouchableOpacity onPress={() => load(1, false)}>
            <Text style={[styles.retryText, { color: TEAL }]}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={TEAL}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color={colors.text.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySub, { color: colors.text.muted }]}>
                {emptyMessage(filter)}
              </Text>
            </View>
          }
          ListFooterComponent={
            page < pages ? (
              <TouchableOpacity
                onPress={handleLoadMore}
                disabled={loadingMore}
                style={[styles.loadMoreBtn, { borderColor: colors.border.default }]}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={TEAL} />
                ) : (
                  <Text style={[styles.loadMoreText, { color: colors.text.secondary }]}>
                    Load more
                  </Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  markAllBtn: { padding: 8 },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 16, paddingTop: 4, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: { flex: 1 },
  title: { fontSize: 14, fontWeight: '500' },
  titleUnread: { fontWeight: '700' },
  body: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 6 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
    marginTop: 6,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 64,
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  emptySub: { fontSize: 13, textAlign: 'center' },
  retryText: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  loadMoreBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  loadMoreText: { fontSize: 13, fontWeight: '600' },
});
