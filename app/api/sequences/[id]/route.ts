import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const sequence = await prisma.sequence.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        },
        subscribers: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ sequence })
  } catch (error) {
    console.error('Get sequence error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { name, description, status } = await request.json()

    const sequence = await prisma.sequence.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    const updatedSequence = await prisma.sequence.update({
      where: { id: params.id },
      data: {
        name: name || sequence.name,
        description: description !== undefined ? description : sequence.description,
        status: status || sequence.status
      }
    })

    return NextResponse.json({ sequence: updatedSequence })
  } catch (error) {
    console.error('Update sequence error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const sequence = await prisma.sequence.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    await prisma.sequence.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete sequence error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
