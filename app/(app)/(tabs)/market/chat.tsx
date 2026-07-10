import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConversation } from '@/hooks/useConversation';
import { useGlobalContext } from '@/context/GlobalProvider';

const TEAL  = '#348b8b';
const ORANGE = '#FB902D';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useGlobalContext();

  const convId = conversationId ? parseInt(conversationId) : null;

  const {
    conversation, messages, connected,
    loading, hasMore, sendMessage, loadMore,
  } = useConversation(convId);

  const [input, setInput]     = useState('');
  const flatListRef           = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !connected) return;
    sendMessage(text);
    setInput('');
  };

  const fmtTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return ''; }
  };

  const otherUser = conversation?.other_user;

  const renderMessage = ({ item }: { item: any }) => {
    if (item.message_type !== 'text') return null;
    const isOwn = item.sender_id === user?.id;
    return (
      <View style={[
        styles.bubbleWrapper,
        isOwn ? styles.ownWrapper : styles.otherWrapper,
      ]}>
        {!isOwn && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <View style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isOwn && styles.ownMessageText,
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
          {fmtTime(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUser?.name ?? 'Chat'}
          </Text>
          {conversation?.listing_title && (
            <Text style={styles.headerSub} numberOfLines={1}>
              Re: {conversation.listing_title}
            </Text>
          )}
        </View>
        <View style={styles.connDot}>
          <View style={[
            styles.dot,
            { backgroundColor: connected ? '#16a34a' : '#d1d5db' }
          ]} />
        </View>
      </View>

      {/* Load more */}
      {hasMore && (
        <TouchableOpacity style={styles.loadMore} onPress={loadMore}>
          <Text style={styles.loadMoreText}>Load older messages</Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>
                {connected ? 'No messages yet' : 'Connecting...'}
              </Text>
              <Text style={styles.emptySub}>
                {conversation?.listing_title
                  ? `Ask about ${conversation.listing_title}`
                  : 'Send a message to get started'}
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <View style={styles.inputBar}>
          {!connected && (
            <View style={styles.reconnecting}>
              <ActivityIndicator size="small" color={ORANGE} />
              <Text style={styles.reconnectingText}>Reconnecting...</Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={2000}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!connected || !input.trim()) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!connected || !input.trim()}>
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f9fafb' },
  header:           { flexDirection: 'row', alignItems: 'center',
                      padding: 16, backgroundColor: 'white',
                      borderBottomWidth: 1, borderBottomColor: '#F1F3F7' },
  backBtn:          { padding: 4, marginRight: 8 },
  headerInfo:       { flex: 1 },
  headerName:       { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  headerSub:        { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  connDot:          { paddingLeft: 8 },
  dot:              { width: 8, height: 8, borderRadius: 4 },
  loadMore:         { alignItems: 'center', padding: 10,
                      backgroundColor: '#f0fdfa' },
  loadMoreText:     { fontSize: 12, color: TEAL, fontWeight: '500' },
  loadingCenter:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList:      { padding: 16, paddingBottom: 8 },
  emptyState:       { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle:       { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  emptySub:         { fontSize: 13, color: '#9ca3af', textAlign: 'center',
                      paddingHorizontal: 32 },
  bubbleWrapper:    { marginBottom: 12, maxWidth: '80%' },
  ownWrapper:       { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherWrapper:     { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName:       { fontSize: 11, color: '#6b7280', marginBottom: 3,
                      marginLeft: 4 },
  bubble:           { borderRadius: 18, paddingHorizontal: 14,
                      paddingVertical: 10 },
  ownBubble:        { backgroundColor: TEAL, borderBottomRightRadius: 4 },
  otherBubble:      { backgroundColor: 'white', borderBottomLeftRadius: 4,
                      borderWidth: 1, borderColor: '#F1F3F7' },
  messageText:      { fontSize: 15, color: '#1f2937', lineHeight: 21 },
  ownMessageText:   { color: 'white' },
  timestamp:        { fontSize: 10, color: '#9ca3af', marginTop: 3,
                      marginLeft: 4 },
  ownTimestamp:     { marginLeft: 0, marginRight: 4 },
  inputBar:         { backgroundColor: 'white',
                      borderTopWidth: 1, borderTopColor: '#F1F3F7' },
  reconnecting:     { flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'center', padding: 6, gap: 6 },
  reconnectingText: { fontSize: 12, color: ORANGE },
  inputRow:         { flexDirection: 'row', alignItems: 'flex-end',
                      padding: 12, gap: 8 },
  input:            { flex: 1, minHeight: 40, maxHeight: 120,
                      borderWidth: 1, borderColor: '#e5e7eb',
                      borderRadius: 20, paddingHorizontal: 16,
                      paddingVertical: 10, fontSize: 15, color: '#1f2937',
                      backgroundColor: '#f9fafb' },
  sendBtn:          { width: 42, height: 42, borderRadius: 21,
                      backgroundColor: TEAL, justifyContent: 'center',
                      alignItems: 'center' },
  sendBtnDisabled:  { backgroundColor: '#9ca3af' },
});
