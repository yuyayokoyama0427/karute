import { useState } from 'react'
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
  const [showSettings, setShowSettings] = useState(false)

  const items: { tab: Tab; label: string; icon: React.ReactNode }[] = [
    {
      tab: 'dashboard',
      label: 'ホーム',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      tab: 'clients',
      label: 'クライアント',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      tab: 'projects',
      label: '案件',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      tab: 'invoices',
      label: '請求',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ]

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'ユーザー'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <>
      {/* ===== デスクトップ: サイドバー ===== */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-52 bg-white border-r border-gray-200 flex-col z-20">
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
              <span className={active === tab ? 'text-indigo-600' : 'text-gray-400'}>{icon}</span>
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

      {/* ===== モバイル: ボトムナビ ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 flex items-stretch safe-area-bottom">
        {items.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors ${
              active === tab ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            {icon}
            <span className="text-[10px] font-medium leading-none">{label}</span>
            {tab === 'invoices' && alertCount != null && alertCount > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] text-[9px] font-bold bg-red-500 text-white rounded-full min-w-[1rem] h-4 flex items-center justify-center px-0.5">
                {alertCount}
              </span>
            )}
          </button>
        ))}

        {/* 設定ボタン */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5c.34 0 .67.01 1 .05M12 5c-.34 0-.67.01-1 .05M12 5V3m0 18v-2m0 2c.34 0 .67-.01 1-.05M12 21c-.34 0-.67-.01-1-.05M21 12h-2m-14 0H3m18 0c0 .34-.01.67-.05 1M3 12c0 .34.01.67.05 1M5.64 5.64l1.42 1.42M16.95 16.95l1.41 1.41M5.64 18.36l1.42-1.42M16.95 7.05l1.41-1.41M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
          </svg>
          <span className="text-[10px] font-medium leading-none">設定</span>
        </button>
      </nav>

      {/* モバイル設定シート */}
      {showSettings && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* ユーザー */}
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* Pro */}
            {isPro ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 rounded-xl">
                <span className="text-indigo-500">✨</span>
                <span className="text-sm font-medium text-indigo-700">Pro プラン利用中</span>
              </div>
            ) : (
              <button
                onClick={() => { setShowSettings(false); onUpgrade() }}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                ✨ Proにアップグレード
              </button>
            )}

            {/* ログアウト */}
            <button
              onClick={() => { setShowSettings(false); onSignOut() }}
              className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors"
            >
              ログアウト
            </button>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2 text-sm text-gray-400"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  )
}
