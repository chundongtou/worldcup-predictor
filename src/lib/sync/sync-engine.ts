/**
 * Core sync engine: orchestrates data fetch → map → update → trigger.
 *
 * Flow:
 * 1. Fetch live match data from external provider
 * 2. Map to internal match IDs
 * 3. Update Supabase matches table
 * 4. For newly finished matches: trigger scoring + review + weight update
 * 5. Log all sync actions
 */

import { createClient } from '@supabase/supabase-js';
import { getActiveProvider, type LiveMatch } from './data-source';
import { mapLiveMatchesToInternal, type MatchUpdate } from './match-mapper';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const agentKey = process.env.AGENT_SECRET_KEY || '';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface SyncResult {
  success: boolean;
  provider: string | null;
  liveMatchesFetched: number;
  matchesUpdated: number;
  matchesFinished: number;
  scoringTriggered: number;
  errors: string[];
  timestamp: string;
}

// Generate date range covering today ± 2 days
function getDateRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 1);
  const to = new Date(now);
  to.setDate(to.getDate() + 2);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

// Update matches in Supabase
async function applyUpdates(updates: MatchUpdate[]): Promise<{ updated: number; errors: string[] }> {
  let updated = 0;
  const errors: string[] = [];

  for (const u of updates) {
    try {
      const updateData: any = {
        status: u.status,
        isFinished: u.isFinished,
        updatedAt: new Date().toISOString(),
      };
      if (u.homeScore !== null) updateData.homeScore = u.homeScore;
      if (u.awayScore !== null) updateData.awayScore = u.awayScore;

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', u.matchId);

      if (error) {
        errors.push(`Match ${u.matchId}: ${error.message}`);
      } else {
        updated++;
      }
    } catch (e: any) {
      errors.push(`Match ${u.matchId}: ${e.message}`);
    }
  }

  return { updated, errors };
}

// Trigger scoring for newly finished matches
async function triggerScoring(finishedMatchIds: string[]): Promise<number> {
  let triggered = 0;

  for (const matchId of finishedMatchIds) {
    try {
      // Get the match scores
      const { data: match } = await supabase
        .from('matches')
        .select('homeScore, awayScore')
        .eq('id', matchId)
        .single();

      if (!match || match.homeScore === null || match.awayScore === null) continue;

      // Call agent match-result endpoint (internal)
      const res = await fetch(`${baseUrl}/api/agent/match-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agentKey}`,
        },
        body: JSON.stringify({
          matchId,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        }),
      });

      if (res.ok) triggered++;
    } catch {
      // Non-fatal: scoring will happen on next sync
    }
  }

  return triggered;
}

// Log sync action to Supabase
async function logSync(result: SyncResult): Promise<void> {
  try {
    await supabase.from('agent_actions').insert({
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      actionType: 'data-sync',
      detailsJson: JSON.stringify(result),
      createdAt: result.timestamp,
    });
  } catch {
    // Non-fatal
  }
}

// Main sync function
export async function runSync(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    provider: null,
    liveMatchesFetched: 0,
    matchesUpdated: 0,
    matchesFinished: 0,
    scoringTriggered: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Get active data provider
    const provider = await getActiveProvider();
    if (!provider) {
      result.errors.push('No data source provider available. Set API_FOOTBALL_KEY or FOOTBALL_DATA_KEY.');
      await logSync(result);
      return result;
    }
    result.provider = provider.name;

    // 2. Fetch live + recent matches
    const { from, to } = getDateRange();
    const [liveMatches, dateMatches] = await Promise.all([
      provider.fetchLiveMatches(),
      provider.fetchMatches(from, to),
    ]);

    // Merge and deduplicate
    const allMatches = new Map<string, LiveMatch>();
    for (const m of [...dateMatches, ...liveMatches]) {
      allMatches.set(m.externalId, m);
    }
    const uniqueMatches = Array.from(allMatches.values());
    result.liveMatchesFetched = uniqueMatches.length;

    // 3. Map to internal matches
    const { updates, unmapped } = await mapLiveMatchesToInternal(uniqueMatches);

    if (unmapped.length > 0) {
      result.errors.push(`${unmapped.length} matches could not be mapped to internal teams`);
    }

    // 4. Apply updates
    const { updated, errors } = await applyUpdates(updates);
    result.matchesUpdated = updated;
    result.errors.push(...errors);

    // 5. Identify newly finished matches and trigger scoring
    const finishedUpdates = updates.filter(u => u.isFinished);
    result.matchesFinished = finishedUpdates.length;

    if (finishedUpdates.length > 0) {
      const triggered = await triggerScoring(finishedUpdates.map(u => u.matchId));
      result.scoringTriggered = triggered;
    }

    result.success = true;
  } catch (e: any) {
    result.errors.push(`Sync failed: ${e.message}`);
  }

  await logSync(result);
  return result;
}
