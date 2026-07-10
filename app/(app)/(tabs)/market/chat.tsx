"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useChatSocket, ChatMessage } from '@/lib/wsClient';
import { useGlobalContext } from '@/context/GlobalProvider';

const TEAL = '#348b8b';
const ORANGE = '#FB902D';

export default function ChatScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useGlobalContext();
  const { messages, connected, sendMessage } = useChatSocket(groupId ?? null);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // Scroll to bottom on new message
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

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.sender === user?.email;
    return (
      <View style={[styles.bubbleWrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
        {!isOwn && (
          <Text style={styles.senderName}>{item.sender}</Text>
        )}
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          {item.reply_to && (
            <Text style={styles.replyText}>↩ {item.reply_to}</Text>
          )}
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.text}
          </Text>
        </View>
        <Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection status bar */}
      {!connected && (
        <View style={styles.connectingBar}>
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.connectingText}>Connecting…</Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.message_id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {connected ? 'No messages yet. Say hello!' : 'Waiting for connection…'}
            </Text>
          </View>
        }
      />

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!connected || !input.trim()) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!connected || !input.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f9fafb' },
  connectingBar:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d97706', paddingHorizontal: 16, paddingVertical: 8 },
  connectingText:   { color: '#fff', fontSize: 13, fontWeight: '500' },
  messageList:      { padding: 16, paddingBottom: 8 },
  emptyState:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText:        { color: '#9ca3af', fontSize: 14 },
  bubbleWrapper:    { marginBottom: 12, maxWidth: '80%' },
  ownWrapper:       { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherWrapper:     { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName:       { fontSize: 11, color: '#6b7280', marginBottom: 3, marginLeft: 4 },
  bubble:           { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  ownBubble:        { backgroundColor: TEAL, borderBottomRightRadius: 4 },
  otherBubble:      { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F3F7' },
  replyText:        { fontSize: 11, color: '#9ca3af', marginBottom: 4, fontStyle: 'italic' },
  messageText:      { fontSize: 15, color: '#1f2937', lineHeight: 21 },
  ownMessageText:   { color: '#fff' },
  timestamp:        { fontSize: 10, color: '#9ca3af', marginTop: 3, marginLeft: 4 },
  ownTimestamp:     { marginLeft: 0, marginRight: 4 },
  inputBar:         { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F3F7', gap: 8 },
  input:            { flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#1f2937', backgroundColor: '#f9fafb' },
  sendButton:       { height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#9ca3af' },
  sendButtonText:   { color: '#fff', fontWeight: '600', fontSize: 14 },
});
