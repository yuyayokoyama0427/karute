import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Client, ClientForm, Invoice, Project } from '../types/index'

const FREE_LIMIT = 3

function exportClientsCsv(clients: Client[], projects: Project[], invoices: Invoice[]) {
  const headers = ['名前', '会社名', 'メール', '電話番号', '案件数', '請求合計', 'メモ']
  const rows = clients.map(c => [
    c.name,
    c.company ?? '',
    c.email ?? '',
    c.phone ?? '',
    String(projects.filter(p => p.client_id === c.id).length),
    String(invoices.filter(i => i.client_id === c.id).reduce((s, i) => s + i.amount, 0)),
    c.memo ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `karute_clients_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  clients: Client[]
  projects: Project[]
  invoices: Invoice[]
  isPro: boolean
  onUpgrade: () => void
  onAdd: (form: ClientForm) => Promise<boolean>
  onUpdate: (id: string, form: ClientForm) => Promise<boolean>
  onRemove: (id: string) => Promise<boolean>
  error: string | null
}

const EMPTY_FORM: ClientForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  memo: '',
}

interface ModalProps {
  initial?: ClientForm
  onSave: (form: ClientForm) => Promise<void>
  onClose: () => void
  error: string | null
}

function ClientModal({ initial, onSave, onClose, error }: ModalProps) {
  const [form, setForm] = useState<ClientForm>(initial ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof ClientForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900">
          {initial ? 'クライアントを編集' : 'クライアントを追加'}
        </h2>
        <input
          value={form.name}
          onChange={set('name')}
          placeholder="名前（必須）"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          value={form.company}
          onChange={set('company')}
          placeholder="会社名"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          value={form.email}
          onChange={set('email')}
          placeholder="メールアドレス"
          type="email"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          value={form.phone}
          onChange={set('phone')}
          placeholder="電話番号"
          type="tel"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={form.memo}
          onChange={set('memo')}
          placeholder="メモ"
          rows={2}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {error && <p className="text-base text-red-500">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
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

export function ClientsPage({ clients, projects, invoices, isPro, onUpgrade, onAdd, onUpdate, onRemove, error }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function clientProjectCount(clientId: string) {
    return projects.filter(p => p.client_id === clientId).length
  }

  function clientInvoiceTotal(clientId: string) {
    return invoices
      .filter(inv => inv.client_id === clientId)
      .reduce((sum, inv) => sum + inv.amount, 0)
  }

  function handleAddClick() {
    if (!isPro && clients.length >= FREE_LIMIT) {
      onUpgrade()
      return
    }
    setShowModal(true)
  }

  async function handleSave(form: ClientForm) {
    if (editing) {
      const ok = await onUpdate(editing.id, form)
      if (ok) {
        setEditing(null)
      }
    } else {
      const ok = await onAdd(form)
      if (ok) {
        setShowModal(false)
      }
    }
  }

  async function handleDelete(id: string) {
    await onRemove(id)
    setConfirmDelete(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">クライアント</h2>
        <div className="flex items-center gap-2">
          {!isPro && (
            <span className="text-base text-gray-400">{clients.length}/{FREE_LIMIT}</span>
          )}
          {isPro ? (
            <button
              onClick={() => exportClientsCsv(clients, projects, invoices)}
              className="text-base text-indigo-600 border border-indigo-300 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              CSV
            </button>
          ) : (
            <button
              onClick={onUpgrade}
              className="text-base text-gray-400 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              CSV (Pro)
            </button>
          )}
          <button
            onClick={handleAddClick}
            className="bg-indigo-600 text-white text-base font-medium px-3 py-1.5 rounded-xl hover:bg-indigo-500 transition-colors"
          >
            追加
          </button>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {clients.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-base mb-4">クライアントがまだいません</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-base font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              最初のクライアントを追加する →
            </button>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{client.name}</p>
                  {client.company && (
                    <p className="text-base text-gray-500 truncate">{client.company}</p>
                  )}
                  {client.email && (
                    <p className="text-base text-gray-400 truncate">{client.email}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => setEditing(client)}
                    className="text-base text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setConfirmDelete(client.id)}
                    className="text-base text-red-400 hover:text-red-600 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-base text-gray-400">案件</p>
                  <p className="text-base font-medium text-gray-700">{clientProjectCount(client.id)}件</p>
                </div>
                <div className="text-center">
                  <p className="text-base text-gray-400">請求合計</p>
                  <p className="text-base font-medium text-gray-700">
                    {clientInvoiceTotal(client.id).toLocaleString('ja-JP')}円
                  </p>
                </div>
              </div>
              {client.memo && (
                <p className="text-base text-gray-400 mt-2 line-clamp-2">{client.memo}</p>
              )}
            </div>
          ))
        )}

        {!isPro && clients.length >= FREE_LIMIT && (
          <div className="bg-indigo-50 rounded-2xl p-4 text-center">
            <p className="text-base text-indigo-700 mb-2">無料プランは{FREE_LIMIT}件まで</p>
            <button
              onClick={onUpgrade}
              className="text-base font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Proで無制限に使う →
            </button>
          </div>
        )}
      </div>

      {(showModal || editing) && (
        <ClientModal
          initial={editing ? {
            name: editing.name,
            company: editing.company ?? '',
            email: editing.email ?? '',
            phone: editing.phone ?? '',
            memo: editing.memo ?? '',
          } : undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
          error={error}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900">削除しますか？</h3>
            <p className="text-base text-gray-500">このクライアントを削除します。元に戻せません。</p>
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
