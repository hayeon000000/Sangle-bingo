import React from 'react'
import { Camera, Users, Plus, LogIn } from 'lucide-react'
import { useGame } from '../contexts/GameContext'

export default function HomePage() {
  const { setView } = useGame()

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center p-6 noise-bg">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-acid opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-ink-800 border border-ink-600 flex items-center justify-center shadow-2xl">
              <Camera className="w-12 h-12 text-acid" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-acid flex items-center justify-center">
              <span className="text-ink-950 text-xs font-bold">B</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white tracking-tight">
              Photo<span className="text-acid">Bingo</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-body">
              출사 모임을 위한 실시간 빙고 게임
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => setView('create-room')}
            className="btn-primary w-full flex items-center justify-center gap-2 h-14 text-base"
          >
            <Plus className="w-5 h-5" />
            방 만들기
          </button>

          <button
            onClick={() => setView('join-room')}
            className="btn-secondary w-full flex items-center justify-center gap-2 h-14 text-base"
          >
            <LogIn className="w-5 h-5" />
            방 참여하기
          </button>
        </div>

        {/* Feature highlights */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { icon: '📸', label: '카메라 촬영' },
            { icon: '🤖', label: 'AI 분석' },
            { icon: '🏆', label: '실시간 순위' },
          ].map(({ icon, label }) => (
            <div key={label} className="card p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-gray-400 font-body">{label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600 text-center font-mono">
          v1.0.0 · Photo Bingo
        </p>
      </div>
    </div>
  )
}
