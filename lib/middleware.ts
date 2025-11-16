import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromHeader, verifyToken } from './auth'

export async function authMiddleware(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const token = getTokenFromHeader(request.headers.get('authorization'))

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  return { userId: payload.userId }
}
