export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await validateAgentAuth(request);
    if (authError) return authError;

    // Fetch all matches with their AI predictions
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id, round, groupName, homeTeamId, awayTeamId,
        homeScore, awayScore, matchTime, status, isFinished,
        homeTeam:teams!matches_homeTeamId_fkey(id, name, flagCode),
        awayTeam:teams!matches_awayTeamId_fkey(id, name, flagCode),
        aiPrediction:ai_predictions(id, homeWinProb, drawProb, awayWinProb, predictedHomeScore, predictedAwayScore, confidence)
      `)
      .order('matchTime', { ascending: true });

    if (matchError) {
      return NextResponse.json({ error: 'Failed to fetch matches', details: matchError.message }, { status: 500 });
    }

    // Fetch reviewed match IDs
    const { data: reviews, error: reviewError } = await supabase
      .from('match_reviews')
      .select('matchId, id');

    if (reviewError) {
      return NextResponse.json({ error: 'Failed to fetch reviews', details: reviewError.message }, { status: 500 });
    }

    const reviewedMatchIds = new Set(reviews?.map((r: any) => r.matchId) ?? []);

    // Split into unreviewed and reviewed
    const unreviewed = (matches || [])
      .filter((m: any) => m.isFinished && !reviewedMatchIds.has(m.id))
      .map((m: any) => ({
        ...m,
        aiPrediction: Array.isArray(m.aiPrediction) ? m.aiPrediction[0] : m.aiPrediction
      }));

    const reviewed = (matches || [])
      .filter((m: any) => m.isFinished && reviewedMatchIds.has(m.id))
      .map((m: any) => ({
        ...m,
        aiPrediction: Array.isArray(m.aiPrediction) ? m.aiPrediction[0] : m.aiPrediction
      }));

    return NextResponse.json({
      unreviewed,
      reviewed,
      counts: {
        totalMatches: matches?.length || 0,
        totalFinished: (matches || []).filter((m: any) => m.isFinished).length,
        unreviewedCount: unreviewed.length,
        reviewedCount: reviewed.length,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
