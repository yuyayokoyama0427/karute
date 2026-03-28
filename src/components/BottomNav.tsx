export type Tab = 'dashboard' | 'clients' | 'projects' | 'invoices'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: Props) {
  const items: { tab: Tab; label: string; icon: string }[] = [
    { tab: 'dashboard', label: 'ダッシュボード', icon: '🏠' },
    { tab: 'clients', label: 'クライアント', icon: '👤' },
    { tab: 'projects', label: '案件', icon: '📁' },
    { tab: 'invoices', label: '請求', icon: '💰' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-white border-r border-gray-200 flex flex-col z-20">
      <div className="px-5 py-6 border-b border-gray-100">
        <span className="text-xl font-bold text-indigo-700 tracking-tight">Karute</span>
        <p className="text-xs text-gray-400 mt-0.5">案件管理</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
              active === tab
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2026 Karute</p>
      </div>
    </aside>
  )
}
