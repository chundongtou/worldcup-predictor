export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const round = searchParams.get('round');
    const group = searchParams.get('group');

    let query = supabase
      .from('matches')
      .select('*, homeTeam:teams!matches_homeTeamId_fkey(*), awayTeam:teams!matches_awayTeamId_fkey(*)')
      .order('matchTime', { ascending: true });

    if (round) query = query.eq('round', round);
    if (group) query = query.eq('groupName', group);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch matches', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches', details: String(error) }, { status: 500 });
  }
}
