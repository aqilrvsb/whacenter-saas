'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { Smartphone, Trash2, RefreshCw, Plus, QrCode } from 'lucide-react'

interface Device {
  id: string
  name: string
  whacenterDeviceId: string
  status: 'connected' | 'disconnected' | 'pairing'
  qrCode?: string
  minDelaySeconds: number
  maxDelaySeconds: number
  createdAt: string
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    minDelaySeconds: 3,
    maxDelaySeconds: 7
  })

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const response = await api.get('/devices')
      setDevices(response.data.devices)
    } catch (error) {
      console.error('Failed to load devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/devices', formData)
      setDevices([response.data.device, ...devices])
      setFormData({ name: '', minDelaySeconds: 3, maxDelaySeconds: 7 })
      setShowAddModal(false)

      // Show QR code if device needs pairing
      if (response.data.device.status === 'pairing') {
        setSelectedDevice(response.data.device)
        setShowQRModal(true)
      }
    } catch (error) {
      console.error('Failed to add device:', error)
      alert('Failed to add device')
    }
  }

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return

    try {
      await api.delete(`/devices/${id}`)
      setDevices(devices.filter(d => d.id !== id))
    } catch (error) {
      console.error('Failed to delete device:', error)
      alert('Failed to delete device')
    }
  }

  const handleRefreshDevice = async (device: Device) => {
    try {
      const response = await api.get(`/devices/${device.id}`)
      setDevices(devices.map(d => d.id === device.id ? response.data.device : d))

      // Show QR if still pairing
      if (response.data.device.status === 'pairing' && response.data.device.qrCode) {
        setSelectedDevice(response.data.device)
        setShowQRModal(true)
      }
    } catch (error) {
      console.error('Failed to refresh device:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'pairing': return 'bg-yellow-100 text-yellow-800'
      case 'disconnected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
            <p className="text-gray-600 mt-1">Manage your WhatsApp devices</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Device
          </button>
        </div>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div key={device.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Smartphone className="h-8 w-8 text-whatsapp-green mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-xs text-gray-500">{device.whacenterDeviceId}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(device.status)}`}>
                  {device.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Delay: {device.minDelaySeconds}s - {device.maxDelaySeconds}s</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleRefreshDevice(device)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
                {device.status === 'pairing' && device.qrCode && (
                  <button
                    onClick={() => {
                      setSelectedDevice(device)
                      setShowQRModal(true)
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    QR
                  </button>
                )}
                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No devices yet. Add your first device to get started!</p>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Device</h2>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                  placeholder="My WhatsApp Device"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Delay (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.minDelaySeconds}
                  onChange={(e) => setFormData({ ...formData, minDelaySeconds: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Delay (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.maxDelaySeconds}
                  onChange={(e) => setFormData({ ...formData, maxDelaySeconds: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan QR Code</h2>
            <p className="text-gray-600 mb-4">Scan this QR code with WhatsApp to connect your device</p>
            {selectedDevice.qrCode ? (
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <img src={selectedDevice.qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
              </div>
            ) : (
              <p className="text-gray-500 mb-4">QR code not available</p>
            )}
            <button
              onClick={() => setShowQRModal(false)}
              className="px-6 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
