import React, { useState } from 'react'
import { FiAward } from 'react-icons/fi'
import { useGame } from '../contexts/GameContext'

function ConfettiParticle({ delay, x }) {
  const colors = ['#00FFF5', '#ff6b6b', '#fbbf24', '#a78bfa', '#ffffff']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = Math.random() * 8 + 5
  return (
    <div className="absolute top-0 rounded-sm" style={{
      left: `${x}%`, width: size, height: size, backgroundColor: color,
      animationDelay: `${delay}s`,
      animation: `confettiFall ${0.8 + Math.random() * 0.8}s ease-in ${delay}s forwards`,
      transform: `rotate(${Math.random() * 360}deg)`,
    }} />
  )
}

export default function GameEndModal({ onClose }) {
  const { state, setView } = useGame()
  const { room, currentParticipant } = state
  const [confetti] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 1.2 }))
  )

  const participants = Object.values(state.participants || {})
  const sorted = [...participants].sort((a, b) => (b.completedCount||0) - (a.completedCount||0))
  const winnerCount = room?.winnerCount || 3
  const myRank = sorted.findIndex(p => p.id === currentParticipant?.id) + 1
  const isWinner = myRank > 0 && myRank <= winnerCount

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      {/* 컨페티 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isWinner && confetti.map(p => <ConfettiParticle key={p.id} {...p} />)}
      </div>

      <div className="relative w-full max-w-sm bg-[#20232A] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up"
        style={{ border: '1px solid rgba(0,255,245,0.3)', boxShadow: '0 0 40px rgba(0,255,245,0.2)' }}>

        {/* 상단 배너 */}
        <div className="px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,255,245,0.1), rgba(0,255,245,0.03))' }}>
          <div className="text-5xl mb-3">{isWinner ? '🏆' : '🎮'}</div>
          <h2 className="font-bold text-2xl text-white">
            {isWinner ? '축하합니다! 🎉' : '게임 종료!'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {myRank > 0
              ? (isWinner ? `${myRank}위로 완주했어요!` : `최종 순위: ${myRank}위`)
              : '결과를 집계 중이에요'}
          </p>
        </div>

        {/* 순위 */}
        <div className="px-5 py-4">
          <p className="text-[#00FFF5] text-xs font-bold uppercase tracking-widest mb-3">최종 순위</p>
          <div className="flex flex-col gap-2">
            {sorted.slice(0, 5).map((p, i) => {
              const isMe = p.id === currentParticipant?.id
              const isTop = i < winnerCount
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
              return (
                <div key={p.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all ${
                    isMe
                      ? 'bg-[#00FFF5]/10 border-[#00FFF5]/40'
                      : 'bg-[#2a2d35] border-[#00FFF5]/10'
                  }`}>
                  <div className="w-7 text-center">
                    {medal ? <span className="text-lg">{medal}</span>
                      : <span className="text-gray-500 font-mono text-sm">#{i+1}</span>}
                  </div>
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{p.nickname}</span>
                      {isTop && <FiAward className="w-3.5 h-3.5 text-[#00FFF5]" />}
                    </div>
                    <div className="text-xs text-gray-500">{p.completedCount||0}/25 · {p.bingoLines||0}빙고</div>
                  </div>
                  {isMe && (
                    <span className="text-xs bg-[#00FFF5]/20 text-[#00FFF5] border border-[#00FFF5]/30 px-2 py-0.5 rounded-full font-bold">나</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 버튼 */}
        <div className="px-5 pb-8 flex flex-col gap-2">
          <button onClick={() => { onClose(); setView('results') }}
            className="w-full bg-[#00FFF5] text-[#20232A] font-bold py-3 rounded-full text-base active:scale-95"
            style={{ boxShadow: '0 0 20px rgba(0,255,245,0.5)' }}>
            결과 보기 & AI 심사 🤖
          </button>
          <button onClick={onClose}
            className="w-full bg-[#313541] text-[#00FFF5] font-bold py-3 rounded-full text-sm border border-[#00FFF5]/30 active:scale-95">
            빙고판 보기
          </button>
        </div>
      </div>
    </div>
  )
}
