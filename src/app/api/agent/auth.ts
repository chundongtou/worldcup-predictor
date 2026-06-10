import { NextRequest, NextResponse } from 'next/server';

export function validateAgentAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Missing Authorization header' },
      { status: 401 }
    );
  }

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Invalid Authorization format. Use: Bearer <token>' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const expectedKey = process.env.AGENT_SECRET_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: 'Server configuration error: AGENT_SECRET_KEY not set' },
      { status: 500 }
    );
  }

  if (token !== expectedKey) {
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 403 }
    );
  }

  // Auth passed - return null to continue
  return null;
}
