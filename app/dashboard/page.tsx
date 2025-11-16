'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import api from '@/lib/api'
import {
  Smartphone,
  Megaphone,
  ListOrdered,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface DashboardStats {
  devices: {
    total: number
    connected: number
    disconnected: number
  }
  campaigns: {
    total: number
    active: number
  }
  sequences: {
    total: number
    active: number
  }
  messages: {
    total: number
    sent: number
    failed: number
    pending: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your Whacenter SaaS platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Devices"
            value={stats?.devices.total || 0}
            icon={Smartphone}
            subtitle={`${stats?.devices.connected || 0} connected`}
          />
          <StatCard
            title="Active Campaigns"
            value={stats?.campaigns.active || 0}
            icon={Megaphone}
            subtitle={`${stats?.campaigns.total || 0} total`}
          />
          <StatCard
            title="Active Sequences"
            value={stats?.sequences.active || 0}
            icon={ListOrdered}
            subtitle={`${stats?.sequences.total || 0} total`}
          />
          <StatCard
            title="Total Messages"
            value={stats?.messages.total || 0}
            icon={MessageSquare}
          />
        </div>

        {/* Message Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Message Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.messages.sent || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.messages.failed || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.messages.pending || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/devices"
              className="flex items-center justify-center px-6 py-4 bg-whatsapp-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Add Device
            </a>
            <a
              href="/campaigns"
              className="flex items-center justify-center px-6 py-4 bg-whatsapp-light text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Megaphone className="mr-2 h-5 w-5" />
              Create Campaign
            </a>
            <a
              href="/sequences"
              className="flex items-center justify-center px-6 py-4 bg-whatsapp-dark text-white rounded-lg hover:bg-teal-900 transition-colors"
            >
              <ListOrdered className="mr-2 h-5 w-5" />
              Create Sequence
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
