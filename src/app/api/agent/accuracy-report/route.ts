export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await validateAgentAuth(request);
    if (authError) return authError;

    // Fetch all finished matches
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, round, homeTeamId, awayTeamId, homeScore, awayScore')
      .eq('isFinished', true);

    if (matchError) {
      return NextResponse.json({ error: 'Failed to fetch matches', details: matchError.message }, { status: 500 });
    }

    // Fetch all reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('match_reviews')
      .select('matchId, directionCorrect, scoreCorrect, surpriseLevel');

    if (reviewError) {
      return NextResponse.json({ error: 'Failed to fetch reviews', details: reviewError.message }, { status: 500 });
    }

    const totalFinished = matches?.length || 0;
    const totalReviewed = reviews?.length || 0;

    // Calculate accuracy
    const directionCorrect = (reviews || []).filter((r: any) => r.directionCorrect).length;
    const scoreCorrect = (reviews || []).filter((r: any) => r.scoreCorrect).length;

    const directionAccuracy = totalReviewed > 0 ? Math.round((directionCorrect / totalReviewed) * 100) : 0;
    const scoreAccuracy = totalReviewed > 0 ? Math.round((scoreCorrect / totalReviewed) * 100) : 0;

    // Per-stage breakdown
    const stageMap = new Map<string, { total: number; reviewed: number; directionCorrect: number; scoreCorrect: number }>();

    for (const m of matches || []) {
      const stage = (m as any).round || 'Unknown';
      if (!stageMap.has(stage)) {
        stageMap.set(stage, { total: 0, reviewed: 0, directionCorrect: 0, scoreCorrect: 0 });
      }
      stageMap.get(stage)!.total++;
    }

    for (const r of reviews || []) {
      const match = (matches || []).find((m: any) => m.id === (r as any).matchId);
      if (match) {
        const stage = (match as any).round || 'Unknown';
        const entry = stageMap.get(stage);
        if (entry) {
          entry.reviewed++;
          if ((r as any).directionCorrect) entry.directionCorrect++;
          if ((r as any).scoreCorrect) entry.scoreCorrect++;
        }
      }
    }

    const stageBreakdown: Record<string, any> = {};
    for (const [stage, stats] of Array.from(stageMap.entries())) {
      stageBreakdown[stage] = {
        total: stats.total,
        reviewed: stats.reviewed,
        directionAccuracy: stats.reviewed > 0 ? Math.round((stats.directionCorrect / stats.reviewed) * 100) : 0,
        scoreAccuracy: stats.reviewed > 0 ? Math.round((stats.scoreCorrect / stats.reviewed) * 100) : 0,
      };
    }

    return NextResponse.json({
      totalFinished,
      totalReviewed,
      directionAccuracy,
      scoreAccuracy,
      stageBreakdown,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
