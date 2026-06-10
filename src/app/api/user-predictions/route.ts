export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id') ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('user_predictions')
      .select('*, match:matches(*, homeTeam:teams!matches_homeTeamId_fkey(*), awayTeam:teams!matches_awayTeamId_fkey(*))')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { matchId, predHome, predAway, confidence } = await request.json();
    if (!matchId || predHome === undefined || predAway === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_predictions')
      .upsert({ userId, matchId, predHome: Number(predHome), predAway: Number(predAway), confidence: confidence || 5 }, { onConflict: 'userId,matchId' })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit prediction' }, { status: 500 });
  }
}
