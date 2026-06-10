export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

export async function POST(request: NextRequest) {
  const authError = validateAgentAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, homeScore, awayScore' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('matches')
      .update({
        homeScore,
        awayScore,
        status: 'FINISHED',
        isFinished: true,
      })
      .eq('id', matchId)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update match', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      match: data?.[0] ?? null,
      message: `Match ${matchId} updated: ${homeScore}-${awayScore}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
