import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { whacenterClient } from '@/lib/whacenter'

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (auth instanceof NextResponse) return auth

  try {
    const devices = await prisma.device.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ devices })
  } catch (error) {
    console.error('Get devices error:', error)
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
    const { name, minDelaySeconds, maxDelaySeconds } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Device name is required' },
        { status: 400 }
      )
    }

    // Generate unique device ID
    const whacenterDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Pair device with Whacenter
    const whacenterDevice = await whacenterClient.pairDevice(whacenterDeviceId)

    const device = await prisma.device.create({
      data: {
        userId: auth.userId,
        name,
        whacenterDeviceId,
        status: whacenterDevice.status,
        qrCode: whacenterDevice.qr_code || null,
        minDelaySeconds: minDelaySeconds || 3,
        maxDelaySeconds: maxDelaySeconds || 7
      }
    })

    return NextResponse.json({ device })
  } catch (error) {
    console.error('Create device error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
