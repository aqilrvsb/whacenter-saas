import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  subtitle?: string
}

export default function StatCard({ title, value, icon: Icon, color = 'whatsapp-green', subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color} bg-opacity-10 rounded-lg`}>
          <Icon className={`h-8 w-8 text-${color}`} />
        </div>
      </div>
    </div>
  )
}
