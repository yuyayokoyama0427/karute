import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Client, Invoice, InvoiceForm, InvoiceStatus, Project } from '../types/index'

interface Props {
  invoices: Invoice[]
  projects: Project[]
  clients: Client[]
  isPro: boolean
  onUpgrade: () => void
  onAdd: (form: InvoiceForm) => Promise<boolean>
  onUpdate: (id: string, form: InvoiceForm) => Promise<boolean>
  onUpdateStatus: (id: string, status: InvoiceStatus) => Promise<boolean>
  onRemove: (id: string) => Promise<boolean>
  error: string | null
}

const EMPTY_FORM: InvoiceForm = {
  project_id: '',
  client_id: '',
  amount: '',
  status: 'unpaid',
  invoice_date: '',
  due_date: '',
  paid_date: '',
  memo: '',
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: '未請求',
  invoiced: '請求済',
  paid: '入金済',
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  unpaid: 'bg-gray-100 text-gray-600',
  invoiced: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
}

const NEXT_STATUS: Record<InvoiceStatus, InvoiceStatus | null> = {
  unpaid: 'invoiced',
  invoiced: 'paid',
  paid: null,
}

const NEXT_STATUS_LABEL: Record<InvoiceStatus, string | null> = {
  unpaid: '請求済にする',
  invoiced: '入金済にする',
  paid: null,
}

interface ModalProps {
  initial?: InvoiceForm
  projects: Project[]
  clients: Client[]
  onSave: (form: InvoiceForm) => Promise<void>
  onClose: () => void
  error: string | null
}

function InvoiceModal({ initial, projects, clients, onSave, onClose, error }: ModalProps) {
  const [form, setForm] = useState<InvoiceForm>(initial ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const setField = <K extends keyof InvoiceForm>(k: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value as InvoiceForm[K] }))

  async function handleSave() {
    if (!form.amount) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900">
          {initial ? '請求を編集' : '請求を追加'}
        </h2>
        <select
          value={form.client_id}
          onChange={setField('client_id')}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">クライアントを選択</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={form.project_id}
          onChange={setField('project_id')}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">案件を選択</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <input
          value={form.amount}
          onChange={setField('amount')}
          placeholder="金額（必須）"
          type="number"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={form.status}
          onChange={setField('status')}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="unpaid">未請求</option>
          <option value="invoiced">請求済</option>
          <option value="paid">入金済</option>
        </select>
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-base text-gray-400 mb-1">請求日</p>
            <input
              value={form.invoice_date}
              onChange={setField('invoice_date')}
              type="date"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-400 mb-1">支払期限</p>
            <input
              value={form.due_date}
              onChange={setField('due_date')}
              type="date"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {form.status === 'paid' && (
          <div>
            <p className="text-base text-gray-400 mb-1">入金日</p>
            <input
              value={form.paid_date}
              onChange={setField('paid_date')}
              type="date"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        <textarea
          value={form.memo}
          onChange={setField('memo')}
          placeholder="メモ"
          rows={2}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {error && <p className="text-base text-red-500">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving || !form.amount}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-40"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        <button
          onClick={onClose}
          className="w-full text-base text-gray-400 hover:text-gray-600 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

function exportCsv(invoices: Invoice[], projects: Project[], clients: Client[]) {
  const headers = ['ID', 'クライアント', '案件', '金額', 'ステータス', '請求日', '支払期限', '入金日', 'メモ']
  const rows = invoices.map(inv => [
    inv.id,
    clients.find(c => c.id === inv.client_id)?.name ?? '',
    projects.find(p => p.id === inv.project_id)?.title ?? '',
    inv.amount,
    STATUS_LABELS[inv.status],
    inv.invoice_date ?? '',
    inv.due_date ?? '',
    inv.paid_date ?? '',
    inv.memo ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `karute_invoices_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function InvoicesPage({ invoices, projects, clients, isPro, onUpgrade, onAdd, onUpdate, onUpdateStatus, onRemove, error }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all')

  const filtered = filterStatus === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filterStatus)

  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0)

  function clientName(clientId: string | null) {
    if (!clientId) return null
    return clients.find(c => c.id === clientId)?.name ?? null
  }

  function projectTitle(projectId: string | null) {
    if (!projectId) return null
    return projects.find(p => p.id === projectId)?.title ?? null
  }

  async function handleSave(form: InvoiceForm) {
    if (editing) {
      const ok = await onUpdate(editing.id, form)
      if (ok) setEditing(null)
    } else {
      const ok = await onAdd(form)
      if (ok) setShowModal(false)
    }
  }

  async function handleDelete(id: string) {
    await onRemove(id)
    setConfirmDelete(null)
  }

  async function handleNextStatus(inv: Invoice) {
    const next = NEXT_STATUS[inv.status]
    if (next) {
      await onUpdateStatus(inv.id, next)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">請求</h2>
        <div className="flex items-center gap-2">
          {isPro ? (
            <button
              onClick={() => exportCsv(invoices, projects, clients)}
              className="text-base text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              CSV
            </button>
          ) : (
            <button
              onClick={onUpgrade}
              className="text-base text-gray-400 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              CSV (Pro)
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white text-base font-medium px-3 py-1.5 rounded-xl hover:bg-indigo-500 transition-colors"
          >
            追加
          </button>
        </div>
      </header>

      {/* フィルタ */}
      <div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-1">
        {(['all', 'unpaid', 'invoiced', 'paid'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-base font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filterStatus === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {s === 'all' ? 'すべて' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* 合計 */}
      {filtered.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
          <p className="text-base text-gray-500">{filtered.length}件の合計</p>
          <p className="text-2xl font-bold text-gray-900">
            {total.toLocaleString('ja-JP')}円
          </p>
        </div>
      )}

      <div className="p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-base">請求がまだありません</p>
          </div>
        ) : (
          filtered.map(inv => {
            const nextLabel = NEXT_STATUS_LABEL[inv.status]
            return (
              <div key={inv.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-base font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {inv.amount.toLocaleString('ja-JP')}円
                    </p>
                    {clientName(inv.client_id) && (
                      <p className="text-base text-gray-500">{clientName(inv.client_id)}</p>
                    )}
                    {projectTitle(inv.project_id) && (
                      <p className="text-base text-gray-400">{projectTitle(inv.project_id)}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => setEditing(inv)}
                      className="text-base text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setConfirmDelete(inv.id)}
                      className="text-base text-red-400 hover:text-red-600 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="text-base text-gray-400 space-y-0.5">
                    {inv.invoice_date && <p>請求日: {inv.invoice_date}</p>}
                    {inv.due_date && <p>期限: {inv.due_date}</p>}
                    {inv.paid_date && <p>入金日: {inv.paid_date}</p>}
                  </div>
                  {nextLabel && (
                    <button
                      onClick={() => handleNextStatus(inv)}
                      className="text-base font-medium px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      {nextLabel}
                    </button>
                  )}
                </div>
                {inv.memo && (
                  <p className="text-base text-gray-400 mt-2 line-clamp-2">{inv.memo}</p>
                )}
              </div>
            )
          })
        )}
      </div>

      {(showModal || editing) && (
        <InvoiceModal
          initial={editing ? {
            project_id: editing.project_id ?? '',
            client_id: editing.client_id ?? '',
            amount: String(editing.amount),
            status: editing.status,
            invoice_date: editing.invoice_date ?? '',
            due_date: editing.due_date ?? '',
            paid_date: editing.paid_date ?? '',
            memo: editing.memo ?? '',
          } : undefined}
          projects={projects}
          clients={clients}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
          error={error}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900">削除しますか？</h3>
            <p className="text-base text-gray-500">この請求を削除します。元に戻せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-base text-gray-600 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-base font-medium transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
