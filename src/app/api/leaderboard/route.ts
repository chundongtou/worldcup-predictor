export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, totalPoints, correctPredictions, totalPredictions')
      .order('totalPoints', { ascending: false });

    if (error) throw error;

    const leaderboard = (data || []).map(u => ({
      ...u,
      accuracy: u.totalPredictions > 0 ? Math.round((u.correctPredictions / u.totalPredictions) * 100) : 0
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
