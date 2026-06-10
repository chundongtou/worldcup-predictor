export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

export async function POST(request: NextRequest) {
  try {
    const authError = await validateAgentAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      matchId,
      reviewText,
      tags,
      predictionErrorHome,
      predictionErrorAway,
      directionCorrect,
      scoreCorrect,
      surpriseLevel,
    } = body;

    if (!matchId || !reviewText) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, reviewText' },
        { status: 400 }
      );
    }

    // Insert into match_reviews
    const reviewId = `mr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const { data: review, error: reviewError } = await supabase
      .from('match_reviews')
      .insert({
        id: reviewId,
        matchId,
        reviewText,
        tags: tags ?? [],
        predictionErrorHome: predictionErrorHome ?? null,
        predictionErrorAway: predictionErrorAway ?? null,
        directionCorrect: directionCorrect ?? null,
        scoreCorrect: scoreCorrect ?? null,
        surpriseLevel: surpriseLevel ?? null,
        reviewedAt: new Date().toISOString(),
      })
      .select();

    if (reviewError) {
      return NextResponse.json(
        { error: 'Failed to insert review', details: reviewError.message },
        { status: 500 }
      );
    }

    // Also log in agent_actions
    const actionId = `aa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const { data: action, error: actionError } = await supabase
      .from('agent_actions')
      .insert({
        id: actionId,
        actionType: 'write-log',
        detailsJson: JSON.stringify({
          matchId,
          reviewId: review?.[0]?.id,
          tags,
          directionCorrect,
          scoreCorrect,
          surpriseLevel,
        }),
        createdAt: new Date().toISOString(),
      })
      .select();

    if (actionError) {
      console.error('Failed to log action (non-fatal):', actionError);
    }

    return NextResponse.json({
      success: true,
      review: review?.[0],
      message: `Review written for match ${matchId}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
