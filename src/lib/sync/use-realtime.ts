/**
 * React hook for real-time match data updates via Supabase Realtime.
 *
 * Subscribes to matches table changes and triggers re-fetch.
 * Use alongside React Query for automatic UI refresh.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseRealtimeOptions {
  enabled?: boolean;
  onMatchUpdate?: (match: any) => void;
  onMatchFinished?: (match: any) => void;
}

export function useRealtimeMatches(options: UseRealtimeOptions = {}) {
  const { enabled = true, onMatchUpdate, onMatchFinished } = options;
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    supabaseRef.current = supabase;

    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          const match = payload.new;
          onMatchUpdate?.(match);

          // Detect newly finished matches
          if (match.isFinished && !payload.old?.isFinished) {
            onMatchFinished?.(match);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, onMatchUpdate, onMatchFinished]);

  return {
    isSubscribed: !!supabaseRef.current,
  };
}

/**
 * Hook to poll for leaderboard updates.
 * Use when Supabase Realtime is not available.
 */
export function usePollingLeaderboard(intervalMs: number = 30000) {
  const callbackRef = useRef<(() => void) | null>(null);

  const setCallback = useCallback((cb: () => void) => {
    callbackRef.current = cb;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      callbackRef.current?.();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return { setCallback };
}
