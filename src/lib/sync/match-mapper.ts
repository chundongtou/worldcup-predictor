/**
 * Maps external live data to internal match records.
 * Handles team name normalization and fuzzy matching.
 */

import { createClient } from '@supabase/supabase-js';
import type { LiveMatch } from './data-source';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface InternalTeam {
  id: string;
  name: string;
}

// Normalize team names for fuzzy matching
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/fc$/i, '')
    .trim();
}

// Alias map for common name mismatches
const TEAM_ALIASES: Record<string, string> = {
  'usa': 'United States',
  'us': 'United States',
  'unitedstates': 'United States',
  'usmnt': 'United States',
  'southkorea': 'South Korea',
  'korea': 'South Korea',
  'republicofkorea': 'South Korea',
  'cotedivoire': "Cote d'Ivoire",
  'ivorycoast': "Cote d'Ivoire",
  'coted\'ivoire': "Cote d'Ivoire",
  'bosnia': 'Bosnia Herzegovina',
  'bosniaandherzegovina': 'Bosnia Herzegovina',
  'bosniaherzegovina': 'Bosnia Herzegovina',
  'turkey': 'Turkiye',
  'türkiye': 'Turkiye',
  'czechia': 'Czechia',
  'czechrepublic': 'Czechia',
  'drcongo': 'DR Congo',
  'democraticrepublicofthecongo': 'DR Congo',
  'congodr': 'DR Congo',
  'newzealand': 'New Zealand',
  'saudiarabia': 'Saudi Arabia',
  'costarica': 'Costa Rica',
  'capeverde': 'Cabo Verde',
  'cabo verde': 'Cabo Verde',
  'curacao': 'Curacao',
  'curaçao': 'Curacao',
};

let teamCache: InternalTeam[] | null = null;

async function loadTeams(): Promise<InternalTeam[]> {
  if (teamCache) return teamCache;
  const { data, error } = await supabase.from('teams').select('id, name');
  if (error) throw new Error(`Failed to load teams: ${error.message}`);
  teamCache = data || [];
  return teamCache;
}

export function clearTeamCache(): void {
  teamCache = null;
}

export async function findTeamId(externalName: string): Promise<string | null> {
  const teams = await loadTeams();
  const normalized = normalize(externalName);

  // Direct match
  for (const t of teams) {
    if (normalize(t.name) === normalized) return t.id;
  }

  // Alias match
  const alias = TEAM_ALIASES[normalized];
  if (alias) {
    for (const t of teams) {
      if (normalize(t.name) === normalize(alias)) return t.id;
    }
  }

  // Partial match (contains)
  for (const t of teams) {
    const tn = normalize(t.name);
    if (tn.includes(normalized) || normalized.includes(tn)) return t.id;
  }

  return null;
}

export interface MatchUpdate {
  matchId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  isFinished: boolean;
}

export async function mapLiveMatchesToInternal(
  liveMatches: LiveMatch[]
): Promise<{ updates: MatchUpdate[]; unmapped: LiveMatch[] }> {
  const { data: internalMatches, error } = await supabase
    .from('matches')
    .select('id, homeTeamId, awayTeamId, status, isFinished, homeTeam:teams!matches_homeTeamId_fkey(name), awayTeam:teams!matches_awayTeamId_fkey(name)')
    .eq('isFinished', false);

  if (error) throw new Error(`Failed to load internal matches: ${error.message}`);

  const updates: MatchUpdate[] = [];
  const unmapped: LiveMatch[] = [];

  for (const live of liveMatches) {
    const homeId = await findTeamId(live.homeTeamName);
    const awayId = await findTeamId(live.awayTeamName);

    if (!homeId || !awayId) {
      unmapped.push(live);
      continue;
    }

    // Find matching internal match
    const match = (internalMatches || []).find(
      (m: any) => m.homeTeamId === homeId && m.awayTeamId === awayId
    );

    if (!match) continue;

    const isFinished = live.status === 'finished';
    const status = live.status === 'live' ? 'live' : live.status === 'finished' ? 'FINISHED' : match.status;

    // Only update if something changed
    if (
      match.status !== status ||
      match.isFinished !== isFinished ||
      live.homeScore !== null && live.homeScore !== (match as any).homeScore ||
      live.awayScore !== null && live.awayScore !== (match as any).awayScore
    ) {
      updates.push({
        matchId: match.id,
        homeScore: live.homeScore,
        awayScore: live.awayScore,
        status,
        isFinished,
      });
    }
  }

  return { updates, unmapped };
}
