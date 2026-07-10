import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/apiClient';
import { ConversationSocket, WSFrame } from '@/lib/wsClient';
import { tokenStore } from '@/lib/tokenStore';

export type ConversationMessage = {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
  is_read: boolean;
  message_type: string;
};

export type OtherUser = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  is_agent: boolean;
};

export type Conversation = {
  id: number;
  status: string;
  other_user: OtherUser;
  listing_title: string | null;
  listing_slug: string | null;
  listing_cover: string | null;
  messages: ConversationMessage[];
  unread_count: number;
  updated_at: string;
};

export function useConversation(
  conversationId: number | null,
  onSignalFrame?: (frame: WSFrame) => void,
) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages]         = useState<ConversationMessage[]>([]);
  const [connected, setConnected]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [hasMore, setHasMore]           = useState(false);
  const socketRef                       = useRef<ConversationSocket | null>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/conversations/${conversationId}/`);
      setConversation(data);
      const msgs: ConversationMessage[] = (data.messages ?? []).map((m: any) => ({
        id:           m.id,
        content:      m.content,
        sender_id:    m.sender,
        sender_name:  m.sender_name,
        created_at:   m.created_at,
        is_read:      m.is_read,
        message_type: m.message_type,
      }));
      setMessages(msgs);
    } catch (e) {
      console.error('[useConversation] load failed', e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (!conversationId || messages.length === 0) return;
    try {
      const { data } = await api.get(
        `/api/conversations/${conversationId}/messages/?before=${messages[0].id}`
      );
      const older: ConversationMessage[] = (data.results ?? []).map((m: any) => ({
        id: m.id, content: m.content, sender_id: m.sender,
        sender_name: m.sender_name, created_at: m.created_at,
        is_read: m.is_read, message_type: m.message_type,
      }));
      setMessages(prev => [...older, ...prev]);
      setHasMore(data.has_more ?? false);
    } catch {}
  }, [conversationId, messages]);

  useEffect(() => {
    if (!conversationId) return;
    loadConversation();

    let socket: ConversationSocket | null = null;

    tokenStore.get().then(token => {
      if (!token) return;
      socket = new ConversationSocket(conversationId, token, {
        onMessage: (frame: WSFrame) => {
          if (frame.type === 'text') {
            setMessages(prev => [...prev, {
              id:           frame.id ?? Date.now(),
              content:      frame.content ?? '',
              sender_id:    frame.sender_id ?? 0,
              sender_name:  frame.sender_name ?? '',
              created_at:   frame.created_at ?? new Date().toISOString(),
              is_read:      false,
              message_type: 'text',
            }]);
          } else {
            onSignalFrame?.(frame);
          }
        },
        onOpen:  () => setConnected(true),
        onClose: () => setConnected(false),
      });
      socket.connect();
      socketRef.current = socket;
    });

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback((content: string) => {
    socketRef.current?.send({ type: 'text', content });
  }, []);

  const sendSignal = useCallback(
    (frame: Omit<WSFrame, 'sender_id'|'sender_name'|'created_at'|'is_read'>) => {
      socketRef.current?.send(frame);
    }, [],
  );

  return {
    conversation, messages, connected,
    loading, hasMore, sendMessage, sendSignal,
    loadMore, socketRef,
  };
}

export function useStartConversation() {
  const [loading, setLoading] = useState(false);

  const startConversation = useCallback(async (
    agentId: number,
    listingSlug?: string,
  ): Promise<Conversation | null> => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/conversations/', {
        agent_id:     agentId,
        listing_slug: listingSlug,
      });
      return data;
    } catch (e) {
      console.error('[useStartConversation] failed', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { startConversation, loading };
}
