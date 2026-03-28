import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Client, Project, ProjectForm, ProjectStatus } from '../types/index'

const FREE_LIMIT = 10

function exportProjectsCsv(projects: Project[], clients: Client[]) {
  const headers = ['案件名', 'クライアント', 'ステータス', '単価', '単価種別', '開始日', '終了日', 'メモ']
  const rows = projects.map(p => [
    p.title,
    clients.find(c => c.id === p.client_id)?.name ?? '',
    p.status === 'active' ? '進行中' : p.status === 'completed' ? '完了' : '保留',
    p.rate != null ? String(p.rate) : '',
    p.rate_type === 'hourly' ? '時給' : '固定',
    p.start_date ?? '',
    p.end_date ?? '',
    p.memo ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `karute_projects_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface Props {
  projects: Project[]
  clients: Client[]
  isPro: boolean
  onUpgrade: () => void
  onAdd: (form: ProjectForm) => Promise<boolean>
  onUpdate: (id: string, form: ProjectForm) => Promise<boolean>
  onUpdateStatus: (id: string, status: ProjectStatus) => Promise<boolean>
  onRemove: (id: string) => Promise<boolean>
  error: string | null
}

const EMPTY_FORM: ProjectForm = {
  client_id: '',
  title: '',
  status: 'active',
  rate: '',
  rate_type: 'fixed',
  start_date: '',
  end_date: '',
  memo: '',
}

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

interface ModalProps {
  initial?: ProjectForm
  clients: Client[]
  onSave: (form: ProjectForm) => Promise<void>
  onClose: () => void
  error: string | null
}

function ProjectModal({ initial, clients, onSave, onClose, error }: ModalProps) {
  const [form, setForm] = useState<ProjectForm>(initial ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const setField = <K extends keyof ProjectForm>(k: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value as ProjectForm[K] }))

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900">
          {initial ? '案件を編集' : '案件を追加'}
        </h2>
        <input
          value={form.title}
          onChange={setField('title')}
          placeholder="案件名（必須）"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        />
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
          value={form.status}
          onChange={setField('status')}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="active">進行中</option>
          <option value="completed">完了</option>
          <option value="paused">保留</option>
        </select>
        <div className="flex gap-2">
          <input
            value={form.rate}
            onChange={setField('rate')}
            placeholder="単価"
            type="number"
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={form.rate_type}
            onChange={setField('rate_type')}
            className="bg-gray-100 rounded-xl px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="fixed">固定</option>
            <option value="hourly">時給</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-base text-gray-400 mb-1">開始日</p>
            <input
              value={form.start_date}
              onChange={setField('start_date')}
              type="date"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-400 mb-1">終了日</p>
            <input
              value={form.end_date}
              onChange={setField('end_date')}
              type="date"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
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
          disabled={saving || !form.title.trim()}
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

export function ProjectsPage({ projects, clients, isPro, onUpgrade, onAdd, onUpdate, onUpdateStatus, onRemove, error }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  const filtered = filterStatus === 'all'
    ? projects
    : projects.filter(p => p.status === filterStatus)

  function clientName(clientId: string | null) {
    if (!clientId) return null
    return clients.find(c => c.id === clientId)?.name ?? null
  }

  function handleAddClick() {
    if (!isPro && projects.length >= FREE_LIMIT) {
      onUpgrade()
      return
    }
    setShowModal(true)
  }

  async function handleSave(form: ProjectForm) {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">案件</h2>
        <div className="flex items-center gap-2">
          {!isPro && (
            <span className="text-base text-gray-400">{projects.length}/{FREE_LIMIT}</span>
          )}
          {/* ビュー切り替え */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400'}`}
              title="リスト表示"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400'}`}
              title="カンバン表示"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
          </div>
          {isPro ? (
            <button
              onClick={() => exportProjectsCsv(projects, clients)}
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

      {/* フィルタ（リストのみ） */}
      {viewMode === 'list' && (
        <div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-1">
          {(['all', 'active', 'completed', 'paused'] as const).map(s => (
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
      )}

      {/* ===== リストビュー ===== */}
      {viewMode === 'list' && (
        <div className="p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📁</p>
              <p className="text-base mb-4">案件がまだありません</p>
              <button
                onClick={handleAddClick}
                className="text-base font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                最初の案件を追加する →
              </button>
            </div>
          ) : (
            filtered.map(project => (
              <div key={project.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.title}</p>
                    {clientName(project.client_id) && (
                      <p className="text-base text-gray-500">{clientName(project.client_id)}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => setEditing(project)} className="text-base text-indigo-500 hover:text-indigo-700 transition-colors">編集</button>
                    <button onClick={() => setConfirmDelete(project.id)} className="text-base text-red-400 hover:text-red-600 transition-colors">削除</button>
                  </div>
                </div>
                {/* クイックステータス変更 */}
                <div className="flex gap-1.5 mt-3">
                  {(['active', 'completed', 'paused'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus(project.id, s)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        project.status === s ? STATUS_COLORS[s] : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-base text-gray-500">
                  {project.rate && (
                    <span>{project.rate.toLocaleString('ja-JP')}円{project.rate_type === 'hourly' ? '/h' : '（固定）'}</span>
                  )}
                  {project.start_date && (
                    <span>{project.start_date}{project.end_date ? ` 〜 ${project.end_date}` : ' 〜'}</span>
                  )}
                </div>
                {project.memo && <p className="text-base text-gray-400 mt-2 line-clamp-2">{project.memo}</p>}
              </div>
            ))
          )}

          {!isPro && projects.length >= FREE_LIMIT && (
            <div className="bg-indigo-50 rounded-2xl p-4 text-center">
              <p className="text-base text-indigo-700 mb-2">無料プランは{FREE_LIMIT}件まで</p>
              <button onClick={onUpgrade} className="text-base font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                Proで無制限に使う →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== カンバンビュー ===== */}
      {viewMode === 'kanban' && (
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-[640px]">
            {(['active', 'completed', 'paused'] as const).map(col => {
              const colProjects = projects.filter(p => p.status === col)
              const colTotal = colProjects.reduce((s, p) => s + (p.rate ?? 0), 0)
              const colColors: Record<ProjectStatus, string> = {
                active: 'border-indigo-200 bg-indigo-50',
                completed: 'border-green-200 bg-green-50',
                paused: 'border-gray-200 bg-gray-50',
              }
              const colHeaderColors: Record<ProjectStatus, string> = {
                active: 'text-indigo-700',
                completed: 'text-green-700',
                paused: 'text-gray-600',
              }
              return (
                <div key={col} className={`flex-1 min-w-[200px] rounded-2xl border-2 ${colColors[col]} flex flex-col`}>
                  {/* カラムヘッダー */}
                  <div className="px-3 py-2.5 border-b border-current/10">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${colHeaderColors[col]}`}>{STATUS_LABELS[col]}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[col]}`}>{colProjects.length}</span>
                    </div>
                    {colTotal > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{colTotal.toLocaleString('ja-JP')}円</p>
                    )}
                  </div>

                  {/* カード */}
                  <div className="p-2 space-y-2 flex-1">
                    {colProjects.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">なし</p>
                    ) : (
                      colProjects.map(project => (
                        <div key={project.id} className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-medium text-gray-900 leading-snug flex-1 min-w-0">{project.title}</p>
                            <button onClick={() => setEditing(project)} className="text-xs text-indigo-400 hover:text-indigo-600 shrink-0">編集</button>
                          </div>
                          {clientName(project.client_id) && (
                            <p className="text-xs text-gray-400 mt-0.5">{clientName(project.client_id)}</p>
                          )}
                          {project.rate && (
                            <p className="text-xs text-gray-500 mt-1">
                              {project.rate.toLocaleString('ja-JP')}円{project.rate_type === 'hourly' ? '/h' : ''}
                            </p>
                          )}
                          {/* 他ステータスへ移動 */}
                          <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                            {(['active', 'completed', 'paused'] as const)
                              .filter(s => s !== col)
                              .map(s => (
                                <button
                                  key={s}
                                  onClick={() => onUpdateStatus(project.id, s)}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                  → {STATUS_LABELS[s]}
                                </button>
                              ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 追加ボタン */}
                  <button
                    onClick={handleAddClick}
                    className="mx-2 mb-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded-xl transition-colors"
                  >
                    + 追加
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(showModal || editing) && (
        <ProjectModal
          initial={editing ? {
            client_id: editing.client_id ?? '',
            title: editing.title,
            status: editing.status,
            rate: editing.rate != null ? String(editing.rate) : '',
            rate_type: editing.rate_type,
            start_date: editing.start_date ?? '',
            end_date: editing.end_date ?? '',
            memo: editing.memo ?? '',
          } : undefined}
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
            <p className="text-base text-gray-500">この案件を削除します。元に戻せません。</p>
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
