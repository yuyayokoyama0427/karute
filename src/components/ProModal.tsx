import { useState } from 'react'

const CHECKOUT_URL = 'https://yomiyasu.lemonsqueezy.com/checkout/buy/d5d409f7-b8bd-4ef3-bdc7-04635deab906'

interface Props {
  onActivate: (key: string) => Promise<void>
  onClose: () => void
  loading: boolean
  error: string | null
}

export function ProModal({ onActivate, onClose, loading, error }: Props) {
  const [key, setKey] = useState('')
  const [view, setView] = useState<'upgrade' | 'activate'>('upgrade')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        {view === 'upgrade' ? (
          <>
            <h2 className="text-lg font-bold text-gray-900">Karute Pro</h2>
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-indigo-900 font-medium">月額 ¥500</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ クライアント・案件を無制限に登録</li>
                <li>✅ 請求CSVエクスポート</li>
                <li>✅ すべての機能を制限なく利用</li>
              </ul>
            </div>
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-center font-medium rounded-xl transition-colors"
            >
              月額500円で始める
            </a>
            <button
              onClick={() => setView('activate')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ライセンスキーを持っている
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-400 hover:text-gray-500 transition-colors"
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900">ライセンスキーを入力</h2>
            <input
              autoFocus
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-gray-100 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={() => onActivate(key)}
              disabled={loading || !key.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-40"
            >
              {loading ? '確認中...' : '認証する'}
            </button>
            <button
              onClick={() => setView('upgrade')}
              className="w-full text-sm text-gray-400 hover:text-gray-500 transition-colors"
            >
              戻る
            </button>
          </>
        )}
      </div>
    </div>
  )
}
