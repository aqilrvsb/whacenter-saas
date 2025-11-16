'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react'

interface Sequence {
  id: string
  name: string
  status: string
  steps: {
    stepNumber: number
  }[]
  subscribers: {
    id: string
    phone: string
    currentStep: number
    status: string
    lastMessageAt?: string
    createdAt: string
  }[]
}

export default function SequenceSummaryPage() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSequences()
  }, [])

  const loadSequences = async () => {
    try {
      const response = await api.get('/sequences')
      // Load full details for each sequence
      const detailedSequences = await Promise.all(
        response.data.sequences.map(async (seq: any) => {
          const detail = await api.get(`/sequences/${seq.id}`)
          return detail.data.sequence
        })
      )
      setSequences(detailedSequences)
    } catch (error) {
      console.error('Failed to load sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalSequences = sequences.length
  const activeSequences = sequences.filter(s => s.status === 'active').length
  const totalSubscribers = sequences.reduce((sum, s) => sum + s.subscribers.length, 0)
  const activeSubscribers = sequences.reduce(
    (sum, s) => sum + s.subscribers.filter(sub => sub.status === 'active').length,
    0
  )
  const completedSubscribers = sequences.reduce(
    (sum, s) => sum + s.subscribers.filter(sub => sub.status === 'completed').length,
    0
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Sequence Summary</h1>
          <p className="text-gray-600 mt-1">Track subscriber engagement and sequence performance</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sequences</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalSequences}</p>
                <p className="text-sm text-gray-500 mt-1">{activeSequences} active</p>
              </div>
              <TrendingUp className="h-8 w-8 text-whatsapp-green" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubscribers}</p>
                <p className="text-sm text-gray-500 mt-1">across all sequences</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeSubscribers}</p>
                <p className="text-sm text-gray-500 mt-1">in progress</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completedSubscribers}</p>
                <p className="text-sm text-gray-500 mt-1">finished sequences</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Sequences Details */}
        {sequences.map((sequence) => (
          <div key={sequence.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{sequence.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {sequence.steps.length} steps • {sequence.subscribers.length} subscribers
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded ${
                  sequence.status === 'active' ? 'bg-green-100 text-green-800' :
                  sequence.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sequence.status}
                </span>
              </div>
            </div>

            {sequence.subscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Step
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sequence.subscribers.map((subscriber) => (
                      <tr key={subscriber.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subscriber.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            Step {subscriber.currentStep} of {sequence.steps.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscriber.status === 'completed' ? 'bg-green-100 text-green-800' :
                            subscriber.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            subscriber.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.lastMessageAt
                            ? new Date(subscriber.lastMessageAt).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No subscribers yet
              </div>
            )}
          </div>
        ))}

        {sequences.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sequence data available yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
