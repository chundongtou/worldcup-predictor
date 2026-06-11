/**
 * POST /api/sync - Trigger a manual data sync
 * GET  /api/sync - Get last sync status
 *
 * Auth: Bearer token (AGENT_SECRET_KEY)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { validateAgentAuth } from '../agent/auth';
import { runSync } from '@/lib/sync';

// In-memory last sync result (resets on cold start)
let lastSyncResult: any = null;

export async function POST(request: NextRequest) {
  const authError = validateAgentAuth(request);
  if (authError) return authError;

  try {
    const result = await runSync();
    lastSyncResult = result;

    return NextResponse.json({
      success: result.success,
      result,
      message: `Synced ${result.matchesUpdated} matches via ${result.provider || 'none'}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Sync failed', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authError = validateAgentAuth(request);
  if (authError) return authError;

  return NextResponse.json({
    lastSync: lastSyncResult,
    message: lastSyncResult ? 'Last sync result available' : 'No sync has been run yet',
  });
}
