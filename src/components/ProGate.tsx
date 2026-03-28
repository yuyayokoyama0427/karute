import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  isPro: boolean
  onUpgrade: () => void
  message: string
}

export function ProGate({ children, isPro, onUpgrade, message }: Props) {
  if (isPro) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl p-4">
        <p className="text-sm text-gray-700 text-center mb-3">{message}</p>
        <button
          onClick={onUpgrade}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Proにアップグレード
        </button>
      </div>
    </div>
  )
}
