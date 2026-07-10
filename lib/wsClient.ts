import { useEffect, useRef, useState } from 'react';
import { tokenStore } from './tokenStore';

const WS_BASE = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.realvistaproperties.com'
).replace(/^http/, 'ws');
// http:// → ws://   https:// → wss://  automatically

export type ChatMessage = {
  message_id: string;
  sender: string;
  text: string;
  timestamp: string;
  reply_to?: string;
  image?: string;
};

type WSOptions = {
  onMessage: (msg: ChatMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

export class ChatSocket {
  private ws: WebSocket | null = null;
  private groupId: string;
  private options: WSOptions;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(groupId: string, options: WSOptions) {
    this.groupId = groupId;
    this.options = options;
  }

  async connect(): Promise<void> {
    const token = await tokenStore.get();
    if (!token) {
      console.warn('[ChatSocket] No auth token — cannot connect');
      return;
    }
    const url = `${WS_BASE}/ws/chats/${this.groupId}/?token=${token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[ChatSocket] Connected to group ${this.groupId}`);
      this.options.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data: ChatMessage = JSON.parse(event.data);
        this.options.onMessage(data);
      } catch {
        console.warn('[ChatSocket] Failed to parse message', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('[ChatSocket] Disconnected');
      this.options.onClose?.();
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[ChatSocket] Error', error);
      this.options.onError?.(error);
    };
  }

  send(text: string, replyTo?: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[ChatSocket] Not connected — message dropped');
      return;
    }
    const payload: Partial<ChatMessage> = {
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };
    this.ws.send(JSON.stringify(payload));
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export function useChatSocket(groupId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ChatSocket | null>(null);

  useEffect(() => {
    if (!groupId) return;
    const socket = new ChatSocket(groupId, {
      onMessage: (msg) => setMessages((prev) => [...prev, msg]),
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
    });
    socket.connect();
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [groupId]);

  const sendMessage = (text: string, replyTo?: string) => {
    socketRef.current?.send(text, replyTo);
  };

  return { messages, connected, sendMessage };
}

// ─────────────────────────────────────────────────────────────────────────
// ConversationSocket — 1:1 buyer/agent messaging + WebRTC call signalling
// ─────────────────────────────────────────────────────────────────────────

const CONVERSATION_WS_BASE =
  (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.realvistaproperties.com')
    .replace(/^http/, 'ws');

export type WSMessageType =
  | 'text' | 'call_offer' | 'call_answer'
  | 'call_ice' | 'call_end' | 'call_reject';

export type WSFrame = {
  type: WSMessageType;
  id?: number;
  content?: string;
  sdp?: string;
  candidate?: RTCIceCandidateInit;
  sender_id?: number;
  sender_name?: string;
  created_at?: string;
  is_read?: boolean;
};

type ConversationSocketOptions = {
  onMessage:  (frame: WSFrame) => void;
  onOpen?:    () => void;
  onClose?:   () => void;
  onError?:   (e: Event) => void;
};

export class ConversationSocket {
  private ws:              WebSocket | null = null;
  private conversationId:  number;
  private options:         ConversationSocketOptions;
  private reconnectTimer:  ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;
  private token:           string;

  constructor(
    conversationId: number,
    token: string,
    options: ConversationSocketOptions,
  ) {
    this.conversationId = conversationId;
    this.token          = token;
    this.options        = options;
  }

  connect(): void {
    const url =
      `${CONVERSATION_WS_BASE}/ws/conversations/${this.conversationId}/?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen    = () => this.options.onOpen?.();
    this.ws.onmessage = (event) => {
      try {
        const frame: WSFrame = JSON.parse(event.data);
        this.options.onMessage(frame);
      } catch {
        console.warn('[ConversationSocket] bad frame', event.data);
      }
    };
    this.ws.onclose = () => {
      this.options.onClose?.();
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };
    this.ws.onerror = (e) => this.options.onError?.(e);
  }

  send(frame: Omit<WSFrame, 'sender_id'|'sender_name'|'created_at'|'is_read'>): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[ConversationSocket] not connected');
      return;
    }
    this.ws.send(JSON.stringify(frame));
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
