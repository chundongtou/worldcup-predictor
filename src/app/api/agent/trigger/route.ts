export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-db';
import { validateAgentAuth } from '../auth';

const VALID_ACTIONS = ['review', 'tune', 'report'] as const;

export async function POST(request: NextRequest) {
  const authError = validateAgentAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        {
          error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Log the trigger in agent_actions
    const id = `aa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const { data, error } = await supabase
      .from('agent_actions')
      .insert({
        id,
        actionType: `trigger-${action}`,
        detailsJson: JSON.stringify({
          triggeredAction: action,
          triggeredAt: new Date().toISOString(),
        }),
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to log trigger', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      loggedAction: data?.[0] ?? null,
      message: `Agent action '${action}' triggered and logged`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
