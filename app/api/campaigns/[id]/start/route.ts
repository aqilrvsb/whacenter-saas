import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { whacenterClient } from '@/lib/whacenter'

export async function POST(
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
        leads: true
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.device.status !== 'connected') {
      return NextResponse.json(
        { error: 'Device is not connected' },
        { status: 400 }
      )
    }

    // Update campaign status to active
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'active' }
    })

    // Create messages for all leads
    const messages = campaign.leads.map(lead => ({
      deviceId: campaign.deviceId,
      campaignId: campaign.id,
      phone: lead.phone,
      message: campaign.message,
      status: 'pending' as const
    }))

    await prisma.message.createMany({
      data: messages
    })

    // Start sending messages in background
    sendMessagesInBackground(campaign.id, campaign.deviceId, messages)

    return NextResponse.json({
      success: true,
      message: 'Campaign started successfully',
      totalMessages: messages.length
    })
  } catch (error) {
    console.error('Start campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendMessagesInBackground(
  campaignId: string,
  deviceId: string,
  messages: Array<{ phone: string; message: string; deviceId: string; campaignId: string; status: 'pending' }>
) {
  const device = await prisma.device.findUnique({
    where: { id: deviceId }
  })

  if (!device) return

  for (const msg of messages) {
    try {
      // Random delay between min and max
      const delay = (device.minDelaySeconds + Math.random() * (device.maxDelaySeconds - device.minDelaySeconds)) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      // Send via Whacenter
      const result = await whacenterClient.sendMessage({
        device_id: device.whacenterDeviceId,
        phone: msg.phone,
        message: msg.message
      })

      // Update message status
      await prisma.message.updateMany({
        where: {
          campaignId,
          phone: msg.phone,
          status: 'pending'
        },
        data: {
          status: result.success ? 'sent' : 'failed',
          error: result.error,
          sentAt: result.success ? new Date() : null
        }
      })

      // Update campaign counters
      if (result.success) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { sentCount: { increment: 1 } }
        })
      } else {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { failedCount: { increment: 1 } }
        })
      }
    } catch (error) {
      console.error('Send message error:', error)
    }
  }

  // Mark campaign as completed
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'completed' }
  })
}
