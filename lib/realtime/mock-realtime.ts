'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────

export type RealtimeChannel = 'activity_feed' | 'notifications' | 'check_in';

export interface RealtimeEvent {
  id: string;
  channel: RealtimeChannel;
  type: string;
  data: Record<string, string | number>;
  timestamp: string;
}

// ── Mock event generators ────────────────────────────────────

const ACTIVITY_EVENTS = [
  { type: 'check_in', data: { student: 'Rafael Costa', class: 'BJJ Fundamentos' } },
  { type: 'signup', data: { student: 'Novo Aluno', plan: 'Essencial' } },
  { type: 'payment', data: { student: 'Luciana Martins', amount: 347 } },
  { type: 'video_watched', data: { student: 'Pedro Silva', video: 'Raspagem de Meia Guarda' } },
  { type: 'quiz_completed', data: { student: 'Ana Clara', score: 85 } },
];

const NOTIFICATION_EVENTS = [
  { type: 'absence_alert', data: { student: 'Bruno Lima', days: 7 } },
  { type: 'payment_overdue', data: { student: 'Marcos Oliveira', days: 5 } },
  { type: 'graduation_ready', data: { student: 'Camila Santos', belt: 'Azul' } },
];

const CHECKIN_EVENTS = [
  { type: 'check_in', data: { student: 'Rafael Costa', time: '19:02' } },
  { type: 'check_in', data: { student: 'Ana Clara', time: '19:05' } },
  { type: 'check_in', data: { student: 'Pedro Henrique', time: '19:08' } },
];

function generateMockEvent(channel: RealtimeChannel): RealtimeEvent {
  const events = channel === 'activity_feed'
    ? ACTIVITY_EVENTS
    : channel === 'notifications'
      ? NOTIFICATION_EVENTS
      : CHECKIN_EVENTS;

  const event = events[Math.floor(Math.random() * events.length)];
  return {
    id: `rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    channel,
    type: event.type,
    data: event.data as Record<string, string | number>,
    timestamp: new Date().toISOString(),
  };
}

// ── Hook ─────────────────────────────────────────────────────

export function useRealtimeEvents(
  channel: RealtimeChannel,
  intervalMs = 30000,
): RealtimeEvent | null {
  const [latestEvent, setLatestEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const event = generateMockEvent(channel);
      setLatestEvent(event);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [channel, intervalMs]);

  return latestEvent;
}

/**
 * Subscribe to multiple channels.
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
