/**
 * POST /api/sync/full-pipeline - Full automated pipeline:
 * 1. Sync match data from external source
 * 2. Auto-review newly finished matches
 * 3. Trigger weight update if enough new reviews
 *
 * This is the single endpoint to call from cron for the complete loop.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { runSync } from '@/lib/sync';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const agentKey = process.env.AGENT_SECRET_KEY || '';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const cronHeader = request.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${cronSecret}` && cronHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const syncEnabled = process.env.LIVE_SYNC_ENABLED !== 'false';
  if (!syncEnabled) {
    return NextResponse.json({ message: 'Live sync is disabled' });
  }

  const pipelineResult: any = {
    steps: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Step 1: Sync data
    const syncResult = await runSync();
    pipelineResult.steps.push({
      name: 'data-sync',
      success: syncResult.success,
      matchesUpdated: syncResult.matchesUpdated,
      matchesFinished: syncResult.matchesFinished,
      provider: syncResult.provider,
      errors: syncResult.errors,
    });

    // Step 2: Auto-review (only if there were newly finished matches)
    if (syncResult.matchesFinished > 0) {
      try {
        const reviewRes = await fetch(`${baseUrl}/api/agent/auto-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agentKey}`,
          },
        });
        const reviewData = await reviewRes.json();
        pipelineResult.steps.push({
          name: 'auto-review',
          success: reviewRes.ok,
          reviewedCount: reviewData.reviewedCount || 0,
          directionAccuracy: reviewData.directionAccuracy || 0,
          scoreAccuracy: reviewData.scoreAccuracy || 0,
        });
      } catch (e: any) {
        pipelineResult.steps.push({
          name: 'auto-review',
          success: false,
          error: e.message,
        });
      }
    } else {
      pipelineResult.steps.push({
        name: 'auto-review',
        success: true,
        skipped: true,
        reason: 'No newly finished matches',
      });
    }

    // Step 3: Check if weight update is needed (every 10 new reviews)
    const { count: reviewCount } = await supabase
      .from('match_reviews')
      .select('*', { count: 'exact', head: true });

    const { data: latestWeight } = await supabase
      .from('model_weights')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    const latestVersion = latestWeight?.[0]?.version || 0;
    const shouldUpdateWeights = reviewCount && reviewCount > 0 && reviewCount % 10 === 0;

    if (shouldUpdateWeights) {
      try {
        // Get current accuracy
        const accuracyRes = await fetch(`${baseUrl}/api/agent/accuracy-report`, {
          headers: { 'Authorization': `Bearer ${agentKey}` },
        });
        const accuracyData = await accuracyRes.json();

        const weightRes = await fetch(`${baseUrl}/api/agent/update-weights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agentKey}`,
          },
          body: JSON.stringify({
            updatedReason: `Auto-update after ${reviewCount} reviews. Direction accuracy: ${accuracyData.directionAccuracy}%`,
            accuracyBefore: accuracyData.directionAccuracy,
          }),
        });
        const weightData = await weightRes.json();
        pipelineResult.steps.push({
          name: 'weight-update',
          success: weightRes.ok,
          newVersion: weightData.version,
        });
      } catch (e: any) {
        pipelineResult.steps.push({
          name: 'weight-update',
          success: false,
          error: e.message,
        });
      }
    } else {
      pipelineResult.steps.push({
        name: 'weight-update',
        success: true,
        skipped: true,
        reason: `Not yet time (${reviewCount || 0} reviews, next update at next multiple of 10)`,
      });
    }

    // Log pipeline run
    try {
      await supabase.from('agent_actions').insert({
        id: `pipeline_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        actionType: 'full-pipeline',
        detailsJson: JSON.stringify(pipelineResult),
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Non-fatal
    }

    pipelineResult.success = true;
    return NextResponse.json(pipelineResult);

  } catch (err: any) {
    pipelineResult.success = false;
    pipelineResult.error = err.message;
    return NextResponse.json(pipelineResult, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
