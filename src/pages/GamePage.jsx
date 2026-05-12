import React, { useEffect, useState, useCallback } from 'react'
import { FiClock, FiAward } from 'react-icons/fi'
import { useGame, calcBingoLines } from '../contexts/GameContext'
import { useTimer } from '../hooks/useTimer'
import BingoBoard from '../components/BingoBoard'
import GameEndModal from '../components/GameEndModal'

export default function GamePage() {
  const { state, updateCell, endGame } = useGame()
  const { room, currentParticipant, myBoard } = state
  const [showEndModal, setShowEndModal] = useState(false)

  const completedCount = myBoard?.filter(c => c.completed).length || 0
  const bingoLines = myBoard ? calcBingoLines(myBoard) : 0
  const isGameActive = room?.status === 'playing'

  const handleTimerExpire = useCallback(() => {
    setShowEndModal(true); endGame()
  }, [endGame])

  const { formatted, isUrgent, start, isRunning } = useTimer(room?.duration || 30, handleTimerExpire)

  useEffect(() => {
    if (room?.status === 'playing' && room?.startedAt && !isRunning) start(room.startedAt)
  }, [room?.status, room?.startedAt])

  useEffect(() => {
    if (room?.status === 'finished') setShowEndModal(true)
  }, [room?.status])

  const handleCellCapture = useCallback((cellIndex, photo, timestamp) => {
    updateCell(cellIndex, photo, timestamp)
  }, [updateCell])

  if (!myBoard || !currentParticipant) return null

  const participants = Object.values(state.participants || {})
  const sorted = [...participants].sort((a, b) => (b.completedCount||0) - (a.completedCount||0))
  const myRank = sorted.findIndex(p => p.id === currentParticipant.id) + 1

  const pct = (completedCount / 25) * 100
  const timerColor = isUrgent ? '#ff6b6b' : '#00FFF5'
  const timerGlow = isUrgent ? 'rgba(255,107,107,0.7)' : 'rgba(0,255,245,0.7)'

  return (
    <div className="min-h-screen w-screen bg-[#20232A] flex flex-col"
      style={{ boxShadow: 'inset 0 0 20px 5px rgba(0, 255, 245, 0.6)' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          {/* 프로필 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#313541] border border-[#00FFF5]/30 flex items-center justify-center text-xl">
              {currentParticipant.emoji}
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">{currentParticipant.nickname}</div>
              <div className="text-xs text-[#00FFF5]/60">
                #{myRank} · {bingoLines > 0 ? <span className="text-[#00FFF5]">{bingoLines}빙고!</span> : '0빙고'}
              </div>
            </div>
          </div>

          {/* 타이머 */}
          <div className={`font-mono font-bold text-2xl flex items-center gap-1.5 ${isUrgent ? 'animate-pulse' : ''}`}
            style={{ color: timerColor, textShadow: `0 0 12px ${timerGlow}` }}>
            <FiClock className="w-4 h-4" />
            {formatted}
          </div>

          {/* 진행률 */}
          <div className="text-right">
            <div className="font-bold text-lg" style={{ color: '#00FFF5', textShadow: '0 0 8px rgba(0,255,245,0.6)' }}>
              {completedCount}<span className="text-gray-500 font-normal text-sm">/25</span>
            </div>
            <div className="text-xs text-gray-500">완료</div>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mt-3 h-1.5 bg-[#313541] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #00FFF5, #00b8b0)',
              boxShadow: pct > 0 ? '0 0 8px rgba(0,255,245,0.6)' : 'none'
            }} />
        </div>
      </div>

      {/* 빙고 뱃지 */}
      {bingoLines > 0 && (
        <div className="flex gap-2 px-4 mt-2 overflow-x-auto pb-1">
          {Array.from({ length: bingoLines }).map((_, i) => (
            <div key={i} className="shrink-0 border border-[#00FFF5]/50 rounded-full px-3 py-1 text-xs font-bold text-[#00FFF5] bg-[#00FFF5]/10"
              style={{ boxShadow: '0 0 8px rgba(0,255,245,0.3)' }}>
              ✨ BINGO {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* 대기 중 알림 */}
      {!isGameActive && room?.status === 'waiting' && (
        <div className="mx-4 mt-2 bg-[#2a2d35] border border-[#00FFF5]/20 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-gray-400">방장이 게임을 시작하면 촬영할 수 있어요 ⏳</p>
        </div>
      )}

      {/* 빙고판 */}
      <div className="flex-1 p-3">
        <BingoBoard board={myBoard} onCellCapture={handleCellCapture} isGameActive={isGameActive} />
      </div>

      {/* 실시간 순위 바 */}
      {participants.length > 1 && (
        <div className="border-t border-[#00FFF5]/10 bg-[#1a1d22] px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <FiAward className="w-3.5 h-3.5 text-[#00FFF5]" />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">실시간 순위</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sorted.slice(0, 5).map((p, i) => (
              <div key={p.id}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition-all ${
                  p.id === currentParticipant.id
                    ? 'bg-[#00FFF5]/10 border-[#00FFF5]/50'
                    : 'bg-[#2a2d35] border-[#00FFF5]/10'
                }`}>
                <span className="text-[#00FFF5]/40 font-mono text-[10px]">#{i+1}</span>
                <span className="text-sm">{p.emoji}</span>
                <span className="text-xs text-white font-bold truncate max-w-[60px]">{p.nickname}</span>
                <span className="text-xs text-[#00FFF5] font-mono">{p.completedCount||0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEndModal && <GameEndModal onClose={() => setShowEndModal(false)} />}
    </div>
  )
}
