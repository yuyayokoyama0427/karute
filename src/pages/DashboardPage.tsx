import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Client, Invoice, Project } from '../types/index'
import { AlertBanner } from '../components/AlertBanner'
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
  clients: Client[]
  onTabChange: (tab: 'invoices') => void
}

function formatCurrency(n: number): string {
  return n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function DashboardPage({ user, projects, invoices, clients, onTabChange }: Props) {
  const now = new Date()
  const [mode, setMode] = useState<'month' | 'year'>('month')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  // --- 月別 ---
  const monthKey = `${year}-${pad2(month)}`
  const monthPaid = invoices
    .filter(inv => inv.status === 'paid' && inv.paid_date?.startsWith(monthKey))
    .reduce((sum, inv) => sum + inv.amount, 0)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  // --- 年別 ---
  const yearPaid = invoices
    .filter(inv => inv.status === 'paid' && inv.paid_date?.startsWith(String(year)))
    .reduce((sum, inv) => sum + inv.amount, 0)

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = pad2(i + 1)
    const key = `${year}-${m}`
    return {
      name: `${i + 1}月`,
      amount: invoices
        .filter(inv => inv.status === 'paid' && inv.paid_date?.startsWith(key))
        .reduce((s, inv) => s + inv.amount, 0),
    }
  })

  // --- 共通 ---
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

  // --- 来月の入金予定 ---
  const nextMonthNum = month === 12 ? 1 : month + 1
  const nextYearNum = month === 12 ? year + 1 : year
  const nextMonthKey = `${nextYearNum}-${pad2(nextMonthNum)}`
  const nextMonthExpected = invoices
    .filter(inv => inv.status === 'invoiced' && inv.due_date?.startsWith(nextMonthKey))
    .reduce((sum, inv) => sum + inv.amount, 0)

  // --- クライアント別収益ランキング（入金済ベース）---
  const clientRanking = clients
    .map(c => ({
      name: c.name,
      total: invoices
        .filter(inv => inv.client_id === c.id && inv.status === 'paid')
        .reduce((s, inv) => s + inv.amount, 0),
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {user.user_metadata?.full_name ?? user.email?.split('@')[0]} さん、こんにちは
        </p>
      </header>

      <AlertBanner
        invoices={invoices}
        clients={clients}
        onClickInvoices={() => onTabChange('invoices')}
      />

      <div className="p-6 space-y-5">

        {/* モード切替 + ナビ */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-200 rounded-xl p-1">
            <button
              onClick={() => setMode('month')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              月別
            </button>
            <button
              onClick={() => setMode('year')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'year' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              年別
            </button>
          </div>

          {mode === 'month' ? (
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[6rem] text-center">
                {year}年{month}月
              </span>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setYear(y => y - 1)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[4rem] text-center">{year}年</span>
              <button
                onClick={() => setYear(y => y + 1)}
                disabled={year >= now.getFullYear()}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-base text-gray-500 mb-1">
              {mode === 'month' ? `${month}月の入金額` : `${year}年の入金額`}
            </p>
            <p className="text-xl font-bold text-indigo-600">
              {formatCurrency(mode === 'month' ? monthPaid : yearPaid)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-base text-gray-500 mb-1">未回収額</p>
            <p className="text-xl font-bold text-orange-500">{formatCurrency(uncollected)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2">
            <p className="text-base text-gray-500 mb-3">案件数</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-400 mt-0.5">全案件</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{activeProjects}</p>
                <p className="text-sm text-gray-400 mt-0.5">進行中</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'completed').length}</p>
                <p className="text-sm text-gray-400 mt-0.5">完了</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{projects.filter(p => p.status === 'paused').length}</p>
                <p className="text-sm text-gray-400 mt-0.5">保留</p>
              </div>
            </div>
          </div>
        </div>

        {/* グラフ */}
        {mode === 'month' ? (
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
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-base font-medium text-gray-700 mb-3">{year}年 月別入金額</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '入金額']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 来月の入金予定 + クライアント別収益 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">来月の入金予定</p>
            <p className="text-xl font-bold text-indigo-600">{formatCurrency(nextMonthExpected)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{nextYearNum}年{nextMonthNum}月 期限</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">進行中の案件</p>
            <p className="text-xl font-bold text-gray-900">{activeProjects}<span className="text-sm font-normal text-gray-400 ml-1">件</span></p>
            <p className="text-xs text-gray-400 mt-0.5">完了 {projects.filter(p => p.status === 'completed').length}件 / 保留 {projects.filter(p => p.status === 'paused').length}件</p>
          </div>
        </div>

        {/* クライアント別収益ランキング */}
        {clientRanking.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-base font-medium text-gray-700 mb-3">クライアント別収益（入金済）</p>
            <div className="space-y-2">
              {clientRanking.map((c, i) => {
                const maxTotal = clientRanking[0].total
                const pct = maxTotal > 0 ? (c.total / maxTotal) * 100 : 0
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[8rem]">{c.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(c.total)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
                    {clients.find(c => c.id === inv.client_id)?.name && (
                      <p className="text-sm text-gray-500">{clients.find(c => c.id === inv.client_id)?.name}</p>
                    )}
                    {inv.due_date && (
                      <p className="text-sm text-gray-400">期限: {inv.due_date}</p>
                    )}
                  </div>
                  <span className="text-sm bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
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
