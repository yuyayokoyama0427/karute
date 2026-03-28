import type { Invoice } from '../types/index'

export type AlertLevel = 'overdue' | 'urgent' | 'soon'

/** 支払期限までの日数（過去なら負の数） */
export function daysUntilDue(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** 請求書のアラートレベルを返す（paid は常に null） */
export function getInvoiceAlert(inv: Invoice): AlertLevel | null {
  if (inv.status === 'paid') return null
  if (!inv.due_date) return null
  const days = daysUntilDue(inv.due_date)
  if (days < 0) return 'overdue'
  if (days <= 3) return 'urgent'
  if (days <= 7) return 'soon'
  return null
}

/** 注意が必要な請求をまとめて返す */
export function getAlertSummary(invoices: Invoice[]) {
  const overdue: Invoice[] = []
  const urgent: Invoice[] = []
  const soon: Invoice[] = []
  for (const inv of invoices) {
    const level = getInvoiceAlert(inv)
    if (level === 'overdue') overdue.push(inv)
    else if (level === 'urgent') urgent.push(inv)
    else if (level === 'soon') soon.push(inv)
  }
  return { overdue, urgent, soon }
}
