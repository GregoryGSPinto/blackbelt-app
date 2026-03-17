'use client';

// ============================================================
// BlackBelt v2 — Mock Realtime Provider & Hook
// Simulates Supabase Realtime with setInterval for dev/mock mode.
// In production, swap to Supabase Realtime channels.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { isMock } from '@/lib/env';

// ── Types ──────────────────────────────────────────────────────────

export type RealtimeChannel = 'activity_feed' | 'notifications' | 'check_in';

export interface RealtimeEvent {
  id: string;
  channel: RealtimeChannel;
  type: string;
  data: Record<string, string | number>;
  timestamp: string;
}

type ChannelListeners = Map<RealtimeChannel, Set<(event: RealtimeEvent) => void>>;

interface RealtimeContextValue {
  subscribe: (channel: RealtimeChannel, callback: (event: RealtimeEvent) => void) => () => void;
  lastEvent: (channel: RealtimeChannel) => RealtimeEvent | null;
}

// ── Mock event generators ──────────────────────────────────────────

type MockEventDef = { type: string; data: Record<string, string | number> };

const ACTIVITY_EVENTS: MockEventDef[] = [
  { type: 'check_in', data: { student: 'Rafael Costa', class: 'BJJ Fundamentos' } },
  { type: 'signup', data: { student: 'Novo Aluno', plan: 'Essencial' } },
  { type: 'payment', data: { student: 'Luciana Martins', amount: 347 } },
  { type: 'video_watched', data: { student: 'Pedro Silva', video: 'Raspagem de Meia Guarda' } },
  { type: 'quiz_completed', data: { student: 'Ana Clara', score: 85 } },
];

const NOTIFICATION_EVENTS: MockEventDef[] = [
  { type: 'absence_alert', data: { student: 'Bruno Lima', days: 7 } },
  { type: 'payment_overdue', data: { student: 'Marcos Oliveira', days: 5 } },
  { type: 'graduation_ready', data: { student: 'Camila Santos', belt: 'Azul' } },
];

const CHECKIN_EVENTS: MockEventDef[] = [
  { type: 'check_in', data: { student: 'Rafael Costa', time: '19:02' } },
  { type: 'check_in', data: { student: 'Ana Clara', time: '19:05' } },
  { type: 'check_in', data: { student: 'Pedro Henrique', time: '19:08' } },
];

const EVENT_MAP: Record<RealtimeChannel, MockEventDef[]> = {
  activity_feed: ACTIVITY_EVENTS,
  notifications: NOTIFICATION_EVENTS,
  check_in: CHECKIN_EVENTS,
};

function generateMockEvent(channel: RealtimeChannel): RealtimeEvent {
  const events = EVENT_MAP[channel];
  const event = events[Math.floor(Math.random() * events.length)];
  return {
    id: `rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    channel,
    type: event.type,
    data: event.data,
    timestamp: new Date().toISOString(),
  };
}

// ── Context ────────────────────────────────────────────────────────

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const MOCK_INTERVAL_MS = 30_000;

// ── Provider ───────────────────────────────────────────────────────

interface MockRealtimeProviderProps {
  children: ReactNode;
}

export function MockRealtimeProvider({ children }: MockRealtimeProviderProps) {
  const listenersRef = useRef<ChannelListeners>(new Map());
  const latestRef = useRef<Map<RealtimeChannel, RealtimeEvent>>(new Map());
  const [, forceRender] = useState(0);

  const emit = useCallback((channel: RealtimeChannel) => {
    const event = generateMockEvent(channel);
    latestRef.current.set(channel, event);

    const callbacks = listenersRef.current.get(channel);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }

    forceRender((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isMock()) return;

    const channels: RealtimeChannel[] = ['activity_feed', 'notifications', 'check_in'];
    const timers = channels.map((channel, i) =>
      setInterval(() => emit(channel), MOCK_INTERVAL_MS + i * 5_000),
    );

    return () => {
      timers.forEach(clearInterval);
    };
  }, [emit]);

  const subscribe = useCallback(
    (channel: RealtimeChannel, callback: (event: RealtimeEvent) => void): (() => void) => {
      if (!listenersRef.current.has(channel)) {
        listenersRef.current.set(channel, new Set());
      }
      listenersRef.current.get(channel)!.add(callback);

      return () => {
        listenersRef.current.get(channel)?.delete(callback);
      };
    },
    [],
  );

  const lastEvent = useCallback((channel: RealtimeChannel): RealtimeEvent | null => {
    return latestRef.current.get(channel) ?? null;
  }, []);

  const value: RealtimeContextValue = { subscribe, lastEvent };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

MockRealtimeProvider.displayName = 'MockRealtimeProvider';

// ── Hook: useRealtimeEvents ────────────────────────────────────────

/**
 * Subscribe to a realtime channel and get the latest event.
 *
 * When used inside MockRealtimeProvider, events come from the provider.
 * When used standalone (without provider), falls back to local setInterval.
 */
export function useRealtimeEvents(
  channel: RealtimeChannel,
  intervalMs = 30000,
): RealtimeEvent | null {
  const context = useContext(RealtimeContext);
  const [latestEvent, setLatestEvent] = useState<RealtimeEvent | null>(null);

  // Provider-based mode
  useEffect(() => {
    if (!context) return;

    const latest = context.lastEvent(channel);
    if (latest) setLatestEvent(latest);

    const unsub = context.subscribe(channel, (e) => {
      setLatestEvent(e);
    });

    return unsub;
  }, [context, channel]);

  // Standalone fallback mode (no provider)
  useEffect(() => {
    if (context) return;

    const interval = setInterval(() => {
      const event = generateMockEvent(channel);
      setLatestEvent(event);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [context, channel, intervalMs]);

  return latestEvent;
}

// ── Hook: useRealtimeMultiChannel ──────────────────────────────────

/**
 * Subscribe to multiple channels and accumulate events.
 */
export function useRealtimeMultiChannel(
  channels: RealtimeChannel[],
  intervalMs = 30000,
): RealtimeEvent[] {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const addEvent = useCallback((event: RealtimeEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const event = generateMockEvent(channel);
      addEvent(event);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [channels, intervalMs, addEvent]);

  return events;
}
