import axios from 'axios'

const WHACENTER_API_URL = process.env.WHACENTER_API_URL || 'https://api.whacenter.com'
const WHACENTER_API_KEY = process.env.WHACENTER_API_KEY || ''

export interface WhacenterDevice {
  device_id: string
  status: 'connected' | 'disconnected' | 'pairing'
  qr_code?: string
}

export interface WhacenterSendMessageRequest {
  device_id: string
  phone: string
  message: string
}

export interface WhacenterSendMessageResponse {
  success: boolean
  message_id?: string
  error?: string
}

class WhacenterClient {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = WHACENTER_API_URL
    this.apiKey = WHACENTER_API_KEY
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    }
  }

  async pairDevice(deviceId: string): Promise<WhacenterDevice> {
    const response = await axios.post(
      `${this.apiUrl}/devices/pair`,
      { device_id: deviceId },
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getDeviceStatus(deviceId: string): Promise<WhacenterDevice> {
    const response = await axios.get(
      `${this.apiUrl}/devices/${deviceId}/status`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async disconnectDevice(deviceId: string): Promise<{ success: boolean }> {
    const response = await axios.post(
      `${this.apiUrl}/devices/${deviceId}/disconnect`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async sendMessage(request: WhacenterSendMessageRequest): Promise<WhacenterSendMessageResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages/send`,
        request,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }
}

export const whacenterClient = new WhacenterClient()
