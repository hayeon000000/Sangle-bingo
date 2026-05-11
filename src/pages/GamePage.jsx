import React, { useEffect, useState, useCallback } from 'react'
import { useGame, calcBingoLines } from '../contexts/GameContext'
import { useTimer } from '../hooks/useTimer'
import BingoBoard from '../components/BingoBoard'
import GameEndModal from '../components/GameEndModal'
import { LayoutGrid, Trophy, Clock } from 'lucide-react'

export default function GamePage() {
  const { state, updateCell, endGame } = useGame()
  const { room, currentParticipant, myBoard } = state
  const [showEndModal, setShowEndModal] = useState(false)

  const completedCount = myBoard?.filter(c => c.completed).length || 0
  const bingoLines = myBoard ? calcBingoLines(myBoard) : 0
  const isGameActive = room?.status === 'playing'

  const handleTimerExpire = useCallback(() => {
    setShowEndModal(true)
    endGame()
  }, [endGame])

  const { formatted, isUrgent, start, isRunning } = useTimer(
    room?.duration || 30,
    handleTimerExpire
  )

  // Start timer when game begins
  useEffect(() => {
    if (room?.status === 'playing' && room?.startedAt && !isRunning) {
      start(room.startedAt)
    }
  }, [room?.status, room?.startedAt])

  // Check winner condition
  useEffect(() => {
    if (!room || room.status !== 'playing') return
    const participants = Object.values(room.participants || {})
    const winners = participants.filter(p => (p.completedCount || 0) >= 25)
    if (winners.length >= (room.winnerCount || 3)) {
      endGame()
      setShowEndModal(true)
    }
  }, [room])

  // Show end modal when game finishes
  useEffect(() => {
    if (room?.status === 'finished') setShowEndModal(true)
  }, [room?.status])

  const handleCellCapture = useCallback((cellIndex, photo, timestamp) => {
    updateCell(cellIndex, photo, timestamp)
  }, [updateCell])

  if (!myBoard || !currentParticipant) return null

  const participants = Object.values(room?.participants || {})
  const sortedParticipants = [...participants].sort(
    (a, b) => (b.completedCount || 0) - (a.completedCount || 0)
  )
  const myRank = sortedParticipants.findIndex(p => p.id === currentParticipant.id) + 1

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ink-700 flex items-center justify-center text-lg">
              {currentParticipant.emoji}
            </div>
            <div>
              <div className="font-display font-semibold text-sm text-white leading-tight">
                {currentParticipant.nickname}
              </div>
              <div className="text-xs text-gray-500">
                #{myRank} · {bingoLines}빙고
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-mono font-bold text-xl ${
            isUrgent ? 'text-coral animate-pulse' : 'text-acid'
          }`}>
            <Clock className="w-4 h-4" />
            {formatted}
          </div>

          {/* Progress */}
          <div className="text-right">
            <div className="font-display font-bold text-acid">{completedCount}<span className="text-gray-500 font-normal text-sm">/25</span></div>
            <div className="text-xs text-gray-500">완료</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-ink-700">
          <div
            className="h-full bg-acid transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / 25) * 100}%` }}
          />
        </div>
      </div>

      {/* Bingo board */}
      <div className="flex-1 p-3 pb-4">
        {/* Bingo counter badges */}
        {bingoLines > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {Array.from({ length: bingoLines }).map((_, i) => (
              <div key={i} className="shrink-0 bg-acid/10 border border-acid/40 rounded-full px-3 py-1 text-xs font-display font-semibold text-acid flex items-center gap-1">
                ✨ BINGO {i + 1}
              </div>
            ))}
          </div>
        )}

        {!isGameActive && room?.status === 'waiting' && (
          <div className="mb-3 bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-gray-400">방장이 게임을 시작하면 촬영할 수 있어요</p>
          </div>
        )}

        <BingoBoard
          board={myBoard}
          onCellCapture={handleCellCapture}
          isGameActive={isGameActive}
        />
      </div>

      {/* Mini leaderboard */}
      {participants.length > 1 && (
        <div className="border-t border-ink-700 bg-ink-900 px-4 py-3 safe-bottom">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-3.5 h-3.5 text-acid" />
            <span className="text-xs text-gray-500 font-display font-medium">실시간 순위</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {sortedParticipants.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 ${
                  p.id === currentParticipant.id
                    ? 'bg-acid/15 border border-acid/40'
                    : 'bg-ink-800'
                }`}
              >
                <span className="text-gray-500 font-mono text-[10px]">#{i+1}</span>
                <span className="text-sm">{p.emoji}</span>
                <span className="text-xs text-white font-display font-medium truncate max-w-[60px]">{p.nickname}</span>
                <span className="text-xs text-acid font-mono">{p.completedCount || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game end modal */}
      {showEndModal && (
        <GameEndModal onClose={() => setShowEndModal(false)} />
      )}
    </div>
  )
}
