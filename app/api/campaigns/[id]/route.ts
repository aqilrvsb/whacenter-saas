import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { whacenterClient } from '@/lib/whacenter'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      },
      include: {
        device: true,
        leads: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Get campaign error:', error)
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
    const { title, message, status } = await request.json()

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        title: title || campaign.title,
        message: message || campaign.message,
        status: status || campaign.status
      }
    })

    return NextResponse.json({ campaign: updatedCampaign })
  } catch (error) {
    console.error('Update campaign error:', error)
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
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
