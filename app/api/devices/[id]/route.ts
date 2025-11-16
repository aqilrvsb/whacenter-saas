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
    const device = await prisma.device.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Get current status from Whacenter
    try {
      const whacenterStatus = await whacenterClient.getDeviceStatus(device.whacenterDeviceId)

      // Update status if changed
      if (whacenterStatus.status !== device.status) {
        await prisma.device.update({
          where: { id: device.id },
          data: {
            status: whacenterStatus.status,
            qrCode: whacenterStatus.qr_code || null
          }
        })
        device.status = whacenterStatus.status
        device.qrCode = whacenterStatus.qr_code || null
      }
    } catch (error) {
      console.error('Whacenter status check error:', error)
    }

    return NextResponse.json({ device })
  } catch (error) {
    console.error('Get device error:', error)
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
    const { name, minDelaySeconds, maxDelaySeconds } = await request.json()

    const device = await prisma.device.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    const updatedDevice = await prisma.device.update({
      where: { id: params.id },
      data: {
        name: name || device.name,
        minDelaySeconds: minDelaySeconds || device.minDelaySeconds,
        maxDelaySeconds: maxDelaySeconds || device.maxDelaySeconds
      }
    })

    return NextResponse.json({ device: updatedDevice })
  } catch (error) {
    console.error('Update device error:', error)
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
    const device = await prisma.device.findFirst({
      where: {
        id: params.id,
        userId: auth.userId
      }
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Disconnect from Whacenter
    try {
      await whacenterClient.disconnectDevice(device.whacenterDeviceId)
    } catch (error) {
      console.error('Whacenter disconnect error:', error)
    }

    await prisma.device.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete device error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
