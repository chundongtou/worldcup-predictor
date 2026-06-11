/**
 * GET /api/sync/cron - Cron endpoint for automatic periodic sync
 *
 * Called by Vercel Cron or external scheduler.
 * No auth required (protected by Vercel Cron secret or IP allowlist).
 *
 * Set in vercel.json:
 *   { "crons": [{ "path": "/api/sync/cron", "schedule": "*/2 * * * *" }] }
 *
 * Or call externally with CRON_SECRET header.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { runSync } from '@/lib/sync';

export async function GET(request: NextRequest) {
  // Verify cron secret if set
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const cronHeader = request.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${cronSecret}` && cronHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Check if live sync is enabled
  const syncEnabled = process.env.LIVE_SYNC_ENABLED !== 'false';
  if (!syncEnabled) {
    return NextResponse.json({ message: 'Live sync is disabled' });
  }

  try {
    const result = await runSync();

    return NextResponse.json({
      success: result.success,
      synced: result.matchesUpdated,
      finished: result.matchesFinished,
      provider: result.provider,
      errors: result.errors.length > 0 ? result.errors : undefined,
      timestamp: result.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Cron sync failed', details: err.message },
      { status: 500 }
    );
  }
}
