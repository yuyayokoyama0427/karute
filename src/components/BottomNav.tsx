import type { User } from '@supabase/supabase-js'

export type Tab = 'dashboard' | 'clients' | 'projects' | 'invoices'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
  user: User
  isPro: boolean
  onUpgrade: () => void
  onSignOut: () => void
  alertCount?: number
}

export function BottomNav({ active, onChange, user, isPro, onUpgrade, onSignOut, alertCount }: Props) {
  const items: { tab: Tab; label: string; icon: string }[] = [
    { tab: 'dashboard', label: 'ダッシュボード', icon: '🏠' },
    { tab: 'clients', label: 'クライアント', icon: '👤' },
    { tab: 'projects', label: '案件', icon: '📁' },
    { tab: 'invoices', label: '請求', icon: '💰' },
  ]

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'ユーザー'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-white border-r border-gray-200 flex flex-col z-20">
      {/* ロゴ */}
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-indigo-700 tracking-tight">Karute</span>
        <p className="text-xs text-gray-400 mt-0.5">案件管理</p>
      </div>

      {/* ナビ */}
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
            <span className="flex-1">{label}</span>
            {tab === 'invoices' && alertCount != null && alertCount > 0 && (
              <span className="text-xs font-bold bg-red-500 text-white rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Pro表示 */}
      <div className="px-3 pb-3">
        {isPro ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl">
            <span className="text-indigo-500">✨</span>
            <span className="text-sm font-medium text-indigo-700">Pro プラン</span>
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors text-left"
          >
            ✨ Proにアップグレード
          </button>
        )}
      </div>

      {/* ユーザー情報 */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-700 truncate font-medium">{displayName}</span>
        </div>
        <button
          onClick={onSignOut}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </aside>
  )
}
