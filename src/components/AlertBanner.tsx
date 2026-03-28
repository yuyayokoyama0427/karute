import type { Invoice } from '../types/index'
import { getAlertSummary, daysUntilDue } from '../lib/alerts'

interface Props {
  invoices: Invoice[]
  clients: { id: string; name: string }[]
  onClickInvoices: () => void
}

export function AlertBanner({ invoices, clients, onClickInvoices }: Props) {
  const { overdue, urgent } = getAlertSummary(invoices)

  if (overdue.length === 0 && urgent.length === 0) return null

  const clientName = (clientId: string | null) =>
    clients.find(c => c.id === clientId)?.name ?? null

  const items = [
    ...overdue.map(inv => ({ inv, isOverdue: true })),
    ...urgent.map(inv => ({ inv, isOverdue: false })),
  ]

  return (
    <div className="mx-6 mt-5 rounded-2xl overflow-hidden border border-red-200">
      {/* ヘッダー */}
      <div className="bg-red-50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-lg leading-none">⚠️</span>
          <span className="text-sm font-semibold text-red-700">
            {overdue.length > 0 && `期限超過 ${overdue.length}件`}
            {overdue.length > 0 && urgent.length > 0 && '・'}
            {urgent.length > 0 && `期限間近 ${urgent.length}件`}
          </span>
        </div>
        <button
          onClick={onClickInvoices}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          請求一覧 →
        </button>
      </div>

      {/* 一覧 */}
      <div className="bg-white divide-y divide-gray-100">
        {items.slice(0, 4).map(({ inv, isOverdue }) => {
          const days = inv.due_date ? daysUntilDue(inv.due_date) : null
          const name = clientName(inv.client_id)
          return (
            <div key={inv.id} className="px-4 py-2.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-800">
                  {inv.amount.toLocaleString('ja-JP')}円
                </span>
                {name && (
                  <span className="text-xs text-gray-400 ml-2">{name}</span>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isOverdue
                  ? 'bg-red-100 text-red-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {isOverdue
                  ? `${Math.abs(days ?? 0)}日超過`
                  : days === 0
                    ? '今日が期限'
                    : `あと${days}日`
                }
              </span>
            </div>
          )
        })}
        {items.length > 4 && (
          <div className="px-4 py-2 text-xs text-gray-400 text-center">
            他 {items.length - 4}件
          </div>
        )}
      </div>
    </div>
  )
}
