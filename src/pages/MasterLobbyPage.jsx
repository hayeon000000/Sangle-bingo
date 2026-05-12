import React, { useState, useEffect } from 'react'
import { FiCopy, FiCheck, FiPlay, FiStopCircle, FiUsers, FiAward, FiClock, FiLogIn } from 'react-icons/fi'
import { useGame } from '../contexts/GameContext'
import { useTimer } from '../hooks/useTimer'

export default function MasterLobbyPage() {
  const { state, startGame, endGame, setView } = useGame()
  const { room } = state
  const [copied, setCopied] = useState(false)

  const participants = Object.values(state.participants || {})
  const isPlaying = room?.status === 'playing'

  const { formatted, isUrgent, start, isRunning } = useTimer(
    room?.duration || 30, () => endGame()
  )

  useEffect(() => {
    if (isPlaying && room?.startedAt && !isRunning) start(room.startedAt)
  }, [isPlaying, room?.startedAt])

  const handleStart = () => { startGame(); start(Date.now()) }
  const handleCopy = () => {
    navigator.clipboard.writeText(room.id)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const sorted = [...participants].sort((a, b) => (b.completedCount || 0) - (a.completedCount || 0))

  const neonStyle = { boxShadow: 'inset 0 0 20px 5px rgba(0, 255, 245, 0.6)' }

  return (
    <div className="min-h-screen w-screen bg-[#20232A] flex flex-col" style={neonStyle}>
      {/* Header */}
      <div className="px-5 pt-8 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00FFF5] animate-pulse inline-block" />
              <span className="text-[#00FFF5]/60 text-xs font-mono uppercase tracking-widest">마스터 대시보드</span>
            </div>
            <h1 className="text-white font-bold text-2xl">방 #{room?.id}</h1>
          </div>
          {isPlaying && (
            <div className={`font-mono text-3xl font-bold ${isUrgent ? 'text-[#ff6b6b] animate-pulse' : 'text-[#00FFF5]'}`}
              style={isUrgent ? { textShadow: '0 0 12px rgba(255,107,107,0.8)' } : { textShadow: '0 0 12px rgba(0,255,245,0.6)' }}>
              {formatted}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-4">

        {/* 방 코드 공유 */}
        <div className="bg-[#2a2d35] border border-[#00FFF5]/20 rounded-2xl p-5">
          <p className="text-[#00FFF5] text-xs font-bold uppercase tracking-widest mb-3">방 코드 공유</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#20232A] border border-[#00FFF5]/30 rounded-xl px-4 py-3 font-mono text-2xl tracking-[0.3em] text-center text-white"
              style={{ textShadow: '0 0 10px rgba(0,255,245,0.5)' }}>
              {room?.id}
            </div>
            <button onClick={handleCopy}
              className="w-12 h-12 rounded-full bg-[#00FFF5] text-[#20232A] flex items-center justify-center active:scale-90 transition-all"
              style={{ boxShadow: '0 0 15px rgba(0,255,245,0.5)' }}>
              {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
            {room?.password && <span>🔒 {room.password}</span>}
            <span>⏱ {room?.duration}분</span>
            <span>🏆 우승자 {room?.winnerCount}명</span>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FiUsers, label: '참여자', value: participants.length },
            { icon: FiAward, label: '완료', value: participants.filter(p => (p.completedCount||0) >= 25).length },
            { icon: FiClock, label: '제한', value: `${room?.duration}분` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#2a2d35] border border-[#00FFF5]/20 rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 text-[#00FFF5] mx-auto mb-1.5" />
              <div className="font-bold text-xl text-white">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* 참여자 현황 */}
        <div className="bg-[#2a2d35] border border-[#00FFF5]/20 rounded-2xl p-5">
          <p className="text-[#00FFF5] text-xs font-bold uppercase tracking-widest mb-4">
            참여자 현황 ({participants.length}명)
          </p>
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">참여자를 기다리는 중...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sorted.map((p, i) => {
                const pct = Math.round(((p.completedCount || 0) / 25) * 100)
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-[#20232A] border border-[#00FFF5]/10 rounded-xl p-3">
                    <span className="text-[#00FFF5]/40 font-mono text-xs w-5">#{i+1}</span>
                    <div className="w-9 h-9 rounded-xl bg-[#313541] border border-[#00FFF5]/20 flex items-center justify-center text-xl shrink-0">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{p.nickname}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-[#313541] rounded-full overflow-hidden">
                          <div className="h-full bg-[#00FFF5] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, boxShadow: pct > 0 ? '0 0 6px rgba(0,255,245,0.6)' : 'none' }} />
                        </div>
                        <span className="text-xs text-gray-400 font-mono shrink-0">{p.completedCount||0}/25</span>
                      </div>
                    </div>
                    {(p.bingoLines||0) > 0 && (
                      <div className="text-xs font-bold text-[#00FFF5] bg-[#00FFF5]/10 border border-[#00FFF5]/30 px-2 py-1 rounded-full">
                        {p.bingoLines}빙고
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 컨트롤 */}
        {!isPlaying ? (
          <button onClick={handleStart}
            className="w-full bg-[#00FFF5] text-[#20232A] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-base active:scale-95 transition-all"
            style={{ boxShadow: '0 0 20px rgba(0,255,245,0.5)' }}>
            <FiPlay className="w-5 h-5" /> 게임 시작
          </button>
        ) : (
          <button onClick={endGame}
            className="w-full bg-[#ff6b6b] text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 text-base active:scale-95 transition-all"
            style={{ boxShadow: '0 0 20px rgba(255,107,107,0.5)' }}>
            <FiStopCircle className="w-5 h-5" /> 게임 강제 종료
          </button>
        )}

        {!isPlaying && (
          <button onClick={() => setView('join-room')}
            className="w-full bg-[#313541] text-[#00FFF5] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm border border-[#00FFF5]/30 active:scale-95">
            <FiLogIn className="w-4 h-4" /> 참여자로도 입장하기
          </button>
        )}
      </div>
    </div>
  )
}
