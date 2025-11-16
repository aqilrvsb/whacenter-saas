import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const [
      devicesCount,
      connectedDevices,
      campaignsCount,
      activeCampaigns,
      sequencesCount,
      activeSequences,
      totalMessages,
      sentMessages,
      failedMessages
    ] = await Promise.all([
      prisma.device.count({ where: { userId: auth.userId } }),
      prisma.device.count({ where: { userId: auth.userId, status: 'connected' } }),
      prisma.campaign.count({ where: { userId: auth.userId } }),
      prisma.campaign.count({ where: { userId: auth.userId, status: 'active' } }),
      prisma.sequence.count({ where: { userId: auth.userId } }),
      prisma.sequence.count({ where: { userId: auth.userId, status: 'active' } }),
      prisma.message.count({ where: { device: { userId: auth.userId } } }),
      prisma.message.count({ where: { device: { userId: auth.userId }, status: 'sent' } }),
      prisma.message.count({ where: { device: { userId: auth.userId }, status: 'failed' } })
    ])

    // Get recent messages for chart
    const recentMessages = await prisma.message.groupBy({
      by: ['status'],
      where: {
        device: { userId: auth.userId },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      _count: true
    })

    return NextResponse.json({
      devices: {
        total: devicesCount,
        connected: connectedDevices,
        disconnected: devicesCount - connectedDevices
      },
      campaigns: {
        total: campaignsCount,
        active: activeCampaigns
      },
      sequences: {
        total: sequencesCount,
        active: activeSequences
      },
      messages: {
        total: totalMessages,
        sent: sentMessages,
        failed: failedMessages,
        pending: totalMessages - sentMessages - failedMessages
      },
      recentActivity: recentMessages
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
