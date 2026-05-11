import React, { useEffect, useState } from 'react'
import { Trophy, X } from 'lucide-react'
import { useGame } from '../contexts/GameContext'

function ConfettiParticle({ delay, x }) {
  const colors = ['#c8f135', '#ff6b6b', '#38bdf8', '#fbbf24', '#a78bfa']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = Math.random() * 8 + 6

  return (
    <div
      className="absolute top-0 rounded-sm"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animation: `confettiFall ${0.8 + Math.random() * 0.8}s ease-in ${delay}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  )
}

export default function GameEndModal({ onClose }) {
  const { state, setView } = useGame()
  const { room, currentParticipant } = state
  const [confetti] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 1 }))
  )

  const participants = Object.values(room?.participants || {})
  const sorted = [...participants].sort((a, b) => (b.completedCount || 0) - (a.completedCount || 0))
  const winnerCount = room?.winnerCount || 3
  const winners = sorted.slice(0, winnerCount)
  const myRank = sorted.findIndex(p => p.id === currentParticipant?.id) + 1
  const isWinner = myRank > 0 && myRank <= winnerCount

  return (
    <div className="fixed inset-0 z-50 bg-black/80 modal-backdrop flex items-end sm:items-center justify-center">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isWinner && confetti.map(p => <ConfettiParticle key={p.id} {...p} />)}
      </div>

      <div className="relative w-full max-w-sm bg-ink-900 rounded-t-3xl sm:rounded-3xl border border-ink-700 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-acid/20 to-sky-bingo/10 px-6 pt-8 pb-6 text-center border-b border-ink-700">
          <div className="text-5xl mb-3">
            {isWinner ? '🏆' : '🎮'}
          </div>
          <h2 className="font-display font-bold text-2xl text-white">
            {isWinner ? '축하합니다!' : '게임 종료!'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isWinner ? `${myRank}위로 완주했어요!` : `최종 순위: ${myRank}위`}
          </p>
        </div>

        {/* Leaderboard */}
        <div className="px-5 py-4">
          <h3 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest mb-3">최종 순위</h3>
          <div className="flex flex-col gap-2">
            {sorted.slice(0, 5).map((p, i) => {
              const isCurrentUser = p.id === currentParticipant?.id
              const isTop3 = i < winnerCount
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    isCurrentUser ? 'bg-acid/10 border border-acid/30' : 'bg-ink-800'
                  }`}
                >
                  <div className="w-7 text-center">
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className="text-gray-500 font-mono text-sm">#{i+1}</span>
                    )}
                  </div>
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-medium text-sm text-white">{p.nickname}</span>
                      {isTop3 && <Trophy className="w-3.5 h-3.5 text-acid" />}
                    </div>
                    <div className="text-xs text-gray-500">{p.completedCount || 0}/25 · {p.bingoLines || 0}빙고</div>
                  </div>
                  {isCurrentUser && (
                    <span className="text-xs bg-acid/20 text-acid px-2 py-0.5 rounded-full font-display">나</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 flex flex-col gap-2">
          <button
            onClick={() => { onClose(); setView('results') }}
            className="btn-primary w-full h-12"
          >
            결과 보기 & AI 분석 🤖
          </button>
          <button onClick={onClose} className="btn-secondary w-full h-12">
            빙고판 보기
          </button>
        </div>
      </div>
    </div>
  )
}
