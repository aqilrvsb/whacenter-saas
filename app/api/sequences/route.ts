import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const sequences = await prisma.sequence.findMany({
      where: { userId: auth.userId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        _count: {
          select: {
            subscribers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sequences })
  } catch (error) {
    console.error('Get sequences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { name, description, steps } = await request.json()

    if (!name || !steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Name and steps are required' },
        { status: 400 }
      )
    }

    const sequence = await prisma.sequence.create({
      data: {
        userId: auth.userId,
        name,
        description,
        status: 'draft',
        steps: {
          create: steps.map((step: any, index: number) => ({
            stepNumber: index + 1,
            message: step.message,
            delayHours: step.delayHours || 24
          }))
        }
      },
      include: {
        steps: true
      }
    })

    return NextResponse.json({ sequence })
  } catch (error) {
    console.error('Create sequence error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
