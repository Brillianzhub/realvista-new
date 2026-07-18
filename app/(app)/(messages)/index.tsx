import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';

const TEAL = '#348b8b';

type ConversationSummary = {
  id: number;
  other_user: {
    id: number; name: string; email: string;
    avatar_url: string | null; is_agent: boolean;
  };
  last_message: {
    content: string; sender_name: string;
    created_at: string; is_read: boolean;
  } | null;
  unread_count: number;
  listing_title: string | null;
  updated_at: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short'
  });
}

export default function ConversationsScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get('/api/conversations/');
      setConversations(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) {
      console.error('[Conversations] load failed', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: ConversationSummary }) => {
    const initials = (item.other_user.name?.[0] ?? '?').toUpperCase();
    const preview  = item.last_message
      ? `${item.last_message.sender_name}: ${item.last_message.content.slice(0, 50)}`
      : 'No messages yet';

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push({
          pathname: '/(app)/(messages)/chat',
          params: { conversationId: String(item.id) },
        })}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Content */}
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={styles.name} numberOfLines={1}>
              {item.other_user.name}
            </Text>
            <Text style={styles.time}>{timeAgo(item.updated_at)}</Text>
          </View>
          {item.listing_title && (
            <Text style={styles.listingLabel} numberOfLines={1}>
              Re: {item.listing_title}
            </Text>
          )}
          <View style={styles.rowBottom}>
            <Text style={[
              styles.preview,
              item.unread_count > 0 && styles.previewUnread,
            ]} numberOfLines={1}>
              {preview}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.unread_count > 9 ? '9+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={TEAL}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={56} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              Message an agent from a property listing to start a conversation
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: 'white' },
  header:       { flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: 1, borderBottomColor: '#F1F3F7',
                  backgroundColor: 'white' },
  backBtn:      { width: 40, height: 40, justifyContent: 'center' },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: 17,
                  fontWeight: '600', color: '#1f2937' },
  loadingCenter:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  row:          { flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 16, paddingVertical: 12 },
  avatar:       { width: 48, height: 48, borderRadius: 24,
                  backgroundColor: TEAL, justifyContent: 'center',
                  alignItems: 'center', marginRight: 12 },
  avatarText:   { color: 'white', fontSize: 18, fontWeight: '700' },
  rowContent:   { flex: 1 },
  rowTop:       { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 2 },
  name:         { fontSize: 15, fontWeight: '600', color: '#1f2937',
                  flex: 1, marginRight: 8 },
  time:         { fontSize: 11, color: '#9ca3af' },
  listingLabel: { fontSize: 11, color: TEAL, marginBottom: 2 },
  rowBottom:    { flexDirection: 'row', alignItems: 'center' },
  preview:      { fontSize: 13, color: '#6b7280', flex: 1 },
  previewUnread:{ color: '#1f2937', fontWeight: '500' },
  badge:        { width: 20, height: 20, borderRadius: 10,
                  backgroundColor: TEAL, justifyContent: 'center',
                  alignItems: 'center', marginLeft: 8 },
  badgeText:    { color: 'white', fontSize: 10, fontWeight: '700' },
  separator:    { height: 1, backgroundColor: '#F9FAFB',
                  marginLeft: 76 },
  empty:        { alignItems: 'center', paddingTop: 80, gap: 12,
                  paddingHorizontal: 32 },
  emptyTitle:   { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  emptySub:     { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});
