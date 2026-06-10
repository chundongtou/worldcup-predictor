export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

export async function POST(request: NextRequest) {
  const authError = validateAgentAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      dixonColesWeight,
      xgboostWeight,
      eloWeight,
      marketWeight,
      homeAdvantageBonus,
      baselineGoals,
      eloDecayTau,
      updatedReason,
      accuracyBefore,
      accuracyAfter,
    } = body;

    if (!updatedReason) {
      return NextResponse.json(
        { error: 'Missing required field: updatedReason' },
        { status: 400 }
      );
    }

    // Get the current latest version number
    const { data: latestWeights, error: fetchError } = await supabase
      .from('model_weights')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch current version', details: fetchError.message },
        { status: 500 }
      );
    }

    const newVersion = (latestWeights?.[0]?.version ?? 0) + 1;

    const { data, error } = await supabase
      .from('model_weights')
      .insert({
        version: newVersion,
        dixonColesWeight: dixonColesWeight ?? 0.4,
        xgboostWeight: xgboostWeight ?? 0.3,
        eloWeight: eloWeight ?? 0.2,
        marketWeight: marketWeight ?? 0.1,
        homeAdvantageBonus: homeAdvantageBonus ?? 0.05,
        baselineGoals: baselineGoals ?? 2.7,
        eloDecayTau: eloDecayTau ?? 200,
        updatedReason,
        accuracyBefore: accuracyBefore ?? null,
        accuracyAfter: accuracyAfter ?? null,
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to insert weights', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      version: newVersion,
      weights: data?.[0] ?? null,
      message: `Model weights updated to version ${newVersion}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
