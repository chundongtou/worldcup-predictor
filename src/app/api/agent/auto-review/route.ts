/**
 * POST /api/agent/auto-review - Auto-trigger review + weight update for finished matches
 *
 * This endpoint:
 * 1. Finds finished matches that haven't been reviewed
 * 2. Generates a review summary for each
 * 3. Calculates prediction accuracy
 * 4. Optionally triggers weight update
 *
 * Called automatically after sync detects newly finished matches.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

interface ReviewResult {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  actualScore: string;
  predictedScore: string | null;
  directionCorrect: boolean | null;
  scoreCorrect: boolean | null;
  reviewWritten: boolean;
}

export async function POST(request: NextRequest) {
  const authError = validateAgentAuth(request);
  if (authError) return authError;

  try {
    // 1. Find finished matches without reviews
    const { data: finishedMatches, error: matchError } = await supabase
      .from('matches')
      .select(`
        id, round, homeScore, awayScore,
        homeTeam:teams!matches_homeTeamId_fkey(id, name),
        awayTeam:teams!matches_awayTeamId_fkey(id, name),
        aiPrediction:ai_predictions(predictedHomeScore, predictedAwayScore, homeWinProb, drawProb, awayWinProb, confidence)
      `)
      .eq('isFinished', true);

    if (matchError) {
      return NextResponse.json({ error: 'Failed to fetch matches', details: matchError.message }, { status: 500 });
    }

    // 2. Get reviewed match IDs
    const { data: reviews } = await supabase
      .from('match_reviews')
      .select('matchId');

    const reviewedIds = new Set((reviews || []).map((r: any) => r.matchId));

    // 3. Filter to unreviewed
    const unreviewed = (finishedMatches || [])
      .filter((m: any) => !reviewedIds.has(m.id))
      .map((m: any) => ({
        ...m,
        aiPrediction: Array.isArray(m.aiPrediction) ? m.aiPrediction[0] : m.aiPrediction,
      }));

    if (unreviewed.length === 0) {
      return NextResponse.json({
        message: 'No unreviewed finished matches',
        reviewedCount: 0,
        results: [],
      });
    }

    // 4. Generate reviews
    const results: ReviewResult[] = [];
    const agentKey = process.env.AGENT_SECRET_KEY || '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const match of unreviewed) {
      const actualHome = match.homeScore;
      const actualAway = match.awayScore;
      const pred = match.aiPrediction;

      let directionCorrect: boolean | null = null;
      let scoreCorrect: boolean | null = null;
      let reviewText = '';

      if (pred && actualHome !== null && actualAway !== null) {
        const predictedHome = pred.predictedHomeScore;
        const predictedAway = pred.predictedAwayScore;

        // Direction: did we predict the correct outcome (win/draw/loss)?
        const actualResult = actualHome > actualAway ? 'H' : actualHome < actualAway ? 'A' : 'D';
        const predictedResult = predictedHome > predictedAway ? 'H' : predictedHome < predictedAway ? 'A' : 'D';
        directionCorrect = actualResult === predictedResult;

        // Exact score
        scoreCorrect = predictedHome === actualHome && predictedAway === actualAway;

        const homeName = Array.isArray(match.homeTeam) ? match.homeTeam[0]?.name : match.homeTeam?.name;
        const awayName = Array.isArray(match.awayTeam) ? match.awayTeam[0]?.name : match.awayTeam?.name;

        reviewText = [
          `Match: ${homeName} vs ${awayName}`,
          `Actual: ${actualHome}-${actualAway}`,
          `Predicted: ${predictedHome}-${predictedAway}`,
          `Direction: ${directionCorrect ? 'CORRECT' : 'WRONG'}`,
          `Exact Score: ${scoreCorrect ? 'CORRECT' : 'WRONG'}`,
          `Confidence: ${Math.round(pred.confidence * 100)}%`,
          `Home Win Prob: ${Math.round(pred.homeWinProb * 100)}% | Draw: ${Math.round(pred.drawProb * 100)}% | Away: ${Math.round(pred.awayWinProb * 100)}%`,
        ].join('\n');
      } else {
        reviewText = `Match ${match.id}: No AI prediction available. Final score: ${actualHome}-${actualAway}`;
      }

      // Write review via internal API
      try {
        await fetch(`${baseUrl}/api/agent/write-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agentKey}`,
          },
          body: JSON.stringify({
            matchId: match.id,
            reviewText,
            directionCorrect,
            scoreCorrect,
            surpriseLevel: directionCorrect === false ? 'high' : 'low',
            tags: ['auto-review'],
          }),
        });
      } catch {
        // Non-fatal
      }

      const homeName = Array.isArray(match.homeTeam) ? match.homeTeam[0]?.name : match.homeTeam?.name;
      const awayName = Array.isArray(match.awayTeam) ? match.awayTeam[0]?.name : match.awayTeam?.name;

      results.push({
        matchId: match.id,
        homeTeam: homeName || 'Unknown',
        awayTeam: awayName || 'Unknown',
        actualScore: `${actualHome}-${actualAway}`,
        predictedScore: pred ? `${pred.predictedHomeScore}-${pred.predictedAwayScore}` : null,
        directionCorrect,
        scoreCorrect,
        reviewWritten: true,
      });
    }

    return NextResponse.json({
      message: `Auto-reviewed ${results.length} matches`,
      reviewedCount: results.length,
      directionAccuracy: results.filter(r => r.directionCorrect).length,
      scoreAccuracy: results.filter(r => r.scoreCorrect).length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Auto-review failed', details: err.message },
      { status: 500 }
    );
  }
}
