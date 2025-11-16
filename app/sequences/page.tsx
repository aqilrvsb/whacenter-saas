'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { ListOrdered, Plus, Trash2, Play, Pause } from 'lucide-react'

interface Sequence {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused'
  steps: {
    id: string
    stepNumber: number
    message: string
    delayHours: number
  }[]
  _count: {
    subscribers: number
  }
  createdAt: string
}

interface SequenceStep {
  message: string
  delayHours: number
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [{ message: '', delayHours: 24 }] as SequenceStep[]
  })

  useEffect(() => {
    loadSequences()
  }, [])

  const loadSequences = async () => {
    try {
      const response = await api.get('/sequences')
      setSequences(response.data.sequences)
    } catch (error) {
      console.error('Failed to load sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSequence = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/sequences', formData)
      setSequences([response.data.sequence, ...sequences])
      setFormData({
        name: '',
        description: '',
        steps: [{ message: '', delayHours: 24 }]
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add sequence:', error)
      alert('Failed to add sequence')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      await api.put(`/sequences/${id}`, { status: newStatus })
      setSequences(sequences.map(s => s.id === id ? { ...s, status: newStatus } : s))
    } catch (error) {
      console.error('Failed to update sequence:', error)
      alert('Failed to update sequence')
    }
  }

  const handleDeleteSequence = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sequence?')) return

    try {
      await api.delete(`/sequences/${id}`)
      setSequences(sequences.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to delete sequence:', error)
      alert('Failed to delete sequence')
    }
  }

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { message: '', delayHours: 24 }]
    })
  }

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    })
  }

  const updateStep = (index: number, field: keyof SequenceStep, value: any) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, steps: newSteps })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
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
            <h1 className="text-3xl font-bold text-gray-900">Sequences</h1>
            <p className="text-gray-600 mt-1">Create automated message sequences</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-whatsapp-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Sequence
          </button>
        </div>

        {/* Sequences List */}
        <div className="space-y-4">
          {sequences.map((sequence) => (
            <div key={sequence.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{sequence.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(sequence.status)}`}>
                      {sequence.status}
                    </span>
                  </div>
                  {sequence.description && (
                    <p className="text-gray-600 mb-2">{sequence.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Steps: {sequence.steps.length}</span>
                    <span>•</span>
                    <span>Subscribers: {sequence._count.subscribers}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {sequence.status === 'draft' && (
                    <button
                      onClick={() => handleToggleStatus(sequence.id, sequence.status)}
                      className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Activate
                    </button>
                  )}
                  {sequence.status === 'active' && (
                    <button
                      onClick={() => handleToggleStatus(sequence.id, sequence.status)}
                      className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </button>
                  )}
                  {sequence.status === 'paused' && (
                    <button
                      onClick={() => handleToggleStatus(sequence.id, sequence.status)}
                      className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSequence(sequence.id)}
                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Steps Preview */}
              <div className="space-y-2">
                {sequence.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-8 h-8 bg-whatsapp-green text-white rounded-full flex items-center justify-center font-semibold">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{step.message.substring(0, 100)}...</p>
                      <p className="text-xs text-gray-500 mt-1">Delay: {step.delayHours}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {sequences.length === 0 && (
          <div className="text-center py-12">
            <ListOrdered className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sequences yet. Create your first sequence to get started!</p>
          </div>
        )}
      </div>

      {/* Add Sequence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Sequence</h2>
            <form onSubmit={handleAddSequence} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sequence Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                  placeholder="Welcome Series"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                  placeholder="Describe your sequence..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Sequence Steps
                  </label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-sm text-whatsapp-green hover:text-green-600"
                  >
                    + Add Step
                  </button>
                </div>

                {formData.steps.map((step, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Step {index + 1}</span>
                      {formData.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={step.message}
                      onChange={(e) => updateStep(index, 'message', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                      placeholder="Message for this step..."
                    />
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Delay before sending (hours)
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={step.delayHours}
                        onChange={(e) => updateStep(index, 'delayHours', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
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
                  Create Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
