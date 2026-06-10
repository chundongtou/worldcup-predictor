export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');

    // Get finished matches with team data
    let query = supabase
      .from('matches')
      .select('*, homeTeam:teams!matches_homeTeamId_fkey(*), awayTeam:teams!matches_awayTeamId_fkey(*)')
      .eq('isFinished', true)
      .not('homeScore', 'is', null);

    if (group) query = query.eq('groupName', group);

    const { data: matches, error } = await query;
    if (error) throw error;

    // Compute standings per group
    const standingsMap: Record<string, Record<string, any>> = {};

    for (const m of matches || []) {
      const groupName = m.groupName;
      if (!groupName) continue;
      if (!standingsMap[groupName]) standingsMap[groupName] = {};

      for (const side of ['home', 'away'] as const) {
        const teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
        const team = side === 'home' ? m.homeTeam : m.awayTeam;
        const goalsFor = side === 'home' ? m.homeScore : m.awayScore;
        const goalsAgainst = side === 'home' ? m.awayScore : m.homeScore;

        if (!standingsMap[groupName][teamId]) {
          standingsMap[groupName][teamId] = {
            teamId,
            team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
          };
        }
        const t = standingsMap[groupName][teamId];
        t.played++;
        t.goalsFor += goalsFor;
        t.goalsAgainst += goalsAgainst;
        if (goalsFor > goalsAgainst) { t.won++; t.points += 3; }
        else if (goalsFor === goalsAgainst) { t.drawn++; t.points += 1; }
        else { t.lost++; }
      }
    }

    // Format result
    const result: Record<string, any[]> = {};
    for (const [groupName, teamsMap] of Object.entries(standingsMap)) {
      result[groupName] = Object.values(teamsMap)
        .map((t: any) => ({ ...t, goalDifference: t.goalsFor - t.goalsAgainst }))
        .sort((a: any, b: any) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error computing standings:', error);
    return NextResponse.json({ error: 'Failed to compute standings', details: String(error) }, { status: 500 });
  }
}
