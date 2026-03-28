import type { User } from '@supabase/supabase-js'
import type { Invoice, Project } from '../types/index'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  user: User
  projects: Project[]
  invoices: Invoice[]
}

function formatCurrency(n: number): string {
  return n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })
}

export function DashboardPage({ user, projects, invoices }: Props) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const thisMonthPaid = invoices
    .filter(inv => inv.status === 'paid' && inv.paid_date?.startsWith(thisMonth))
    .reduce((sum, inv) => sum + inv.amount, 0)

  const uncollected = invoices
    .filter(inv => inv.status === 'invoiced')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const activeProjects = projects.filter(p => p.status === 'active').length

  const statusData = [
    { name: '進行中', count: projects.filter(p => p.status === 'active').length, color: '#4F46E5' },
    { name: '完了', count: projects.filter(p => p.status === 'completed').length, color: '#22C55E' },
    { name: '保留', count: projects.filter(p => p.status === 'paused').length, color: '#9CA3AF' },
  ]

  const upcomingInvoices = invoices
    .filter(inv => inv.status === 'invoiced')
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {user.user_metadata?.full_name ?? user.email?.split('@')[0]} さん、こんにちは
        </p>
      </header>

      <div className="p-6 space-y-5">

        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-base text-gray-500 mb-1">今月の入金額</p>
            <p className="text-xl font-bold text-indigo-600">{formatCurrency(thisMonthPaid)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-base text-gray-500 mb-1">未回収額</p>
            <p className="text-xl font-bold text-orange-500">{formatCurrency(uncollected)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2">
            <p className="text-base text-gray-500 mb-1">進行中の案件</p>
            <p className="text-2xl font-bold text-gray-900">{activeProjects} 件</p>
          </div>
        </div>

        {/* 案件ステータスグラフ */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-base font-medium text-gray-700 mb-3">案件ステータス</p>
          {projects.length === 0 ? (
            <p className="text-base text-gray-400 text-center py-4">案件がまだありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}件`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 直近の請求 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-base font-medium text-gray-700 mb-3">請求中（支払い期限順）</p>
          {upcomingInvoices.length === 0 ? (
            <p className="text-base text-gray-400">請求中の案件はありません</p>
          ) : (
            <div className="space-y-2">
              {upcomingInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-base font-medium text-gray-800">{formatCurrency(inv.amount)}</p>
                    {inv.due_date && (
                      <p className="text-base text-gray-400">期限: {inv.due_date}</p>
                    )}
                  </div>
                  <span className="text-base bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    請求済
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
