import type { Client, Invoice, Project, ProjectStatus } from '../types/index'
import { getInvoiceAlert, daysUntilDue } from '../lib/alerts'

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: '進行中',
  completed: '完了',
  paused: '保留',
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
}

const INVOICE_STATUS_LABELS = {
  unpaid: '未請求',
  invoiced: '請求済',
  paid: '入金済',
} as const

const INVOICE_STATUS_COLORS = {
  unpaid: 'bg-gray-100 text-gray-600',
  invoiced: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
} as const

function formatCurrency(n: number) {
  return n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })
}

interface Props {
  client: Client
  projects: Project[]
  invoices: Invoice[]
  onBack: () => void
  onEdit: () => void
}

export function ClientDetailPage({ client, projects, invoices, onBack, onEdit }: Props) {
  const clientProjects = projects.filter(p => p.client_id === client.id)
  const clientInvoices = invoices.filter(i => i.client_id === client.id)
  const totalAmount = clientInvoices.reduce((s, i) => s + i.amount, 0)
  const unpaidAmount = clientInvoices
    .filter(i => i.status !== 'paid')
    .reduce((s, i) => s + i.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{client.name}</h2>
          {client.company && (
            <p className="text-sm text-gray-500 truncate">{client.company}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors font-medium"
        >
          編集
        </button>
      </header>

      <div className="p-4 space-y-4">

        {/* 連絡先 */}
        {(client.email || client.phone || client.memo) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${client.email}`} className="text-indigo-600 hover:underline truncate">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${client.phone}`} className="text-indigo-600 hover:underline">{client.phone}</a>
              </div>
            )}
            {client.memo && (
              <p className="text-sm text-gray-500 leading-relaxed">{client.memo}</p>
            )}
          </div>
        )}

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{clientProjects.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">案件数</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <p className="text-base font-bold text-indigo-600">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-gray-400 mt-0.5">請求合計</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <p className="text-base font-bold text-orange-500">{formatCurrency(unpaidAmount)}</p>
            <p className="text-xs text-gray-400 mt-0.5">未回収</p>
          </div>
        </div>

        {/* 案件 */}
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-2 px-1">案件 ({clientProjects.length})</p>
          {clientProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center text-gray-400 text-sm py-8">
              案件がありません
            </div>
          ) : (
            <div className="space-y-2">
              {clientProjects.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{p.title}</p>
                  {p.rate && (
                    <p className="text-sm text-gray-500 mt-1">
                      {p.rate.toLocaleString('ja-JP')}円{p.rate_type === 'hourly' ? '/h' : '（固定）'}
                    </p>
                  )}
                  {p.start_date && (
                    <p className="text-sm text-gray-400">{p.start_date}{p.end_date ? ` 〜 ${p.end_date}` : ' 〜'}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 請求 */}
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-2 px-1">請求 ({clientInvoices.length})</p>
          {clientInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center text-gray-400 text-sm py-8">
              請求がありません
            </div>
          ) : (
            <div className="space-y-2">
              {clientInvoices
                .sort((a, b) => (b.invoice_date ?? '').localeCompare(a.invoice_date ?? ''))
                .map(inv => {
                  const alertLevel = getInvoiceAlert(inv)
                  const days = inv.due_date ? daysUntilDue(inv.due_date) : null
                  return (
                    <div key={inv.id} className={`bg-white rounded-2xl p-4 shadow-sm ${alertLevel === 'overdue' ? 'border border-red-200' : alertLevel === 'urgent' ? 'border border-orange-200' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INVOICE_STATUS_COLORS[inv.status]}`}>
                            {INVOICE_STATUS_LABELS[inv.status]}
                          </span>
                          {alertLevel === 'overdue' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              {Math.abs(days ?? 0)}日超過
                            </span>
                          )}
                          {alertLevel === 'urgent' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              {days === 0 ? '今日が期限' : `あと${days}日`}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-gray-900">{formatCurrency(inv.amount)}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                        {inv.invoice_date && <p>請求日: {inv.invoice_date}</p>}
                        {inv.due_date && (
                          <p className={alertLevel === 'overdue' ? 'text-red-500 font-medium' : alertLevel === 'urgent' ? 'text-orange-500 font-medium' : ''}>
                            期限: {inv.due_date}
                          </p>
                        )}
                        {inv.paid_date && <p>入金日: {inv.paid_date}</p>}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
