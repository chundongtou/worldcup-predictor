export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*, homeTeam:teams!matches_homeTeamId_fkey(*), awayTeam:teams!matches_awayTeamId_fkey(*), aiPrediction:ai_predictions(*)')
      .order('matchTime', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch predictions', details: error.message }, { status: 500 });
    }

    // Flatten aiPrediction from array to single object
    const result = (data || []).map((m: any) => ({
      ...m,
      aiPrediction: Array.isArray(m.aiPrediction) ? (m.aiPrediction[0] || null) : m.aiPrediction
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions', details: String(error) }, { status: 500 });
  }
}
