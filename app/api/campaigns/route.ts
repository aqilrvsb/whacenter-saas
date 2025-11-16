import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: auth.userId },
      include: {
        device: true,
        _count: {
          select: {
            messages: true,
            leads: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Get campaigns error:', error)
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
    const { deviceId, title, message, leads } = await request.json()

    if (!deviceId || !title || !message) {
      return NextResponse.json(
        { error: 'Device, title, and message are required' },
        { status: 400 }
      )
    }

    // Verify device belongs to user
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: auth.userId
      }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: auth.userId,
        deviceId,
        title,
        message,
        status: 'draft',
        totalLeads: leads?.length || 0
      }
    })

    // Create leads if provided
    if (leads && leads.length > 0) {
      await prisma.lead.createMany({
        data: leads.map((lead: any) => ({
          campaignId: campaign.id,
          phone: lead.phone,
          name: lead.name,
          data: lead.data ? JSON.stringify(lead.data) : null
        }))
      })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
