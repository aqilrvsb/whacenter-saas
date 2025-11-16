'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { Megaphone, Plus, Play, Trash2, Edit, Upload } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  message: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  totalLeads: number
  sentCount: number
  failedCount: number
  device: {
    id: string
    name: string
    status: string
  }
  createdAt: string
}

interface Device {
  id: string
  name: string
  status: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    deviceId: '',
    title: '',
    message: '',
    leadsText: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [campaignsRes, devicesRes] = await Promise.all([
        api.get('/campaigns'),
        api.get('/devices')
      ])
      setCampaigns(campaignsRes.data.campaigns)
      setDevices(devicesRes.data.devices)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault()

    // Parse leads from text (phone,name per line)
    const leads = formData.leadsText
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [phone, ...nameParts] = line.split(',').map(s => s.trim())
        return { phone, name: nameParts.join(',') || phone }
      })

    try {
      const response = await api.post('/campaigns', {
        deviceId: formData.deviceId,
        title: formData.title,
        message: formData.message,
        leads
      })
      setCampaigns([response.data.campaign, ...campaigns])
      setFormData({ deviceId: '', title: '', message: '', leadsText: '' })
      setShowAddModal(false)
      loadData() // Reload to get full data
    } catch (error) {
      console.error('Failed to add campaign:', error)
      alert('Failed to add campaign')
    }
  }

  const handleStartCampaign = async (id: string) => {
    if (!confirm('Start this campaign? Messages will be sent to all leads.')) return

    try {
      await api.post(`/campaigns/${id}/start`)
      alert('Campaign started successfully!')
      loadData()
    } catch (error: any) {
      console.error('Failed to start campaign:', error)
      alert(error.response?.data?.error || 'Failed to start campaign')
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      await api.delete(`/campaigns/${id}`)
      setCampaigns(campaigns.filter(c => c.id !== id))
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      alert('Failed to delete campaign')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-1">Create and manage broadcast campaigns</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Campaign
          </button>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{campaign.message.substring(0, 100)}...</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Device: {campaign.device.name}</span>
                    <span>•</span>
                    <span>Leads: {campaign.totalLeads}</span>
                    <span>•</span>
                    <span>Sent: {campaign.sentCount}</span>
                    <span>•</span>
                    <span>Failed: {campaign.failedCount}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStartCampaign(campaign.id)}
                      className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {campaign.totalLeads > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((campaign.sentCount / campaign.totalLeads) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-whatsapp-green h-2 rounded-full transition-all"
                      style={{ width: `${(campaign.sentCount / campaign.totalLeads) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No campaigns yet. Create your first campaign to get started!</p>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Campaign</h2>
            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device
                </label>
                <select
                  required
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                >
                  <option value="">Select a device</option>
                  {devices.filter(d => d.status === 'connected').map(device => (
                    <option key={device.id} value={device.id}>{device.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                  placeholder="My Campaign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                  placeholder="Your message here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leads (one per line: phone,name)
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.leadsText}
                  onChange={(e) => setFormData({ ...formData, leadsText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent font-mono text-sm"
                  placeholder="6281234567890,John Doe&#10;6281234567891,Jane Smith"
                />
                <p className="text-xs text-gray-500 mt-1">Format: phone,name (one per line)</p>
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
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
