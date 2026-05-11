import React, { useState } from 'react'
import { Copy, Check, Play, StopCircle, Users, Trophy, Clock } from 'lucide-react'
import { useGame, calcBingoLines } from '../contexts/GameContext'
import { useTimer } from '../hooks/useTimer'

export default function MasterLobbyPage() {
  const { state, startGame, endGame, setView } = useGame()
  const { room } = state
  const [copied, setCopied] = useState(false)

  const participants = Object.values(room?.participants || {})
  const isPlaying = room?.status === 'playing'

  const { formatted, isUrgent, start, isRunning } = useTimer(
    room?.duration || 30,
    () => endGame()
  )

  const handleStart = () => {
    startGame()
    start(Date.now())
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(room.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sortedParticipants = [...participants].sort(
    (a, b) => (b.completedCount || 0) - (a.completedCount || 0)
  )

  return (
    <div className="min-h-screen bg-ink-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-acid animate-pulse" />
              <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">마스터 대시보드</span>
            </div>
            <h1 className="font-display font-bold text-xl mt-0.5">방 #{room?.id}</h1>
          </div>
          {isPlaying && (
            <div className={`font-mono text-2xl font-bold ${isUrgent ? 'text-coral animate-pulse' : 'text-acid'}`}>
              {formatted}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-5">
        {/* Room code share */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest">방 코드 공유</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-ink-700 rounded-xl px-4 py-3 font-mono text-2xl tracking-widest text-center text-white">
              {room?.id}
            </div>
            <button
              onClick={handleCopy}
              className="w-12 h-12 rounded-xl bg-acid flex items-center justify-center active:scale-95"
            >
              {copied ? <Check className="w-5 h-5 text-ink-950" /> : <Copy className="w-5 h-5 text-ink-950" />}
            </button>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-gray-500">
            {room?.password && <span>🔒 비밀번호: {room.password}</span>}
            <span>⏱ {room?.duration}분</span>
            <span>🏆 우승자 {room?.winnerCount}명</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: '참여자', value: participants.length },
            { icon: Trophy, label: '완료', value: participants.filter(p => p.completedCount >= 25).length },
            { icon: Clock, label: '제한', value: `${room?.duration}분` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <Icon className="w-5 h-5 text-acid mx-auto mb-2" />
              <div className="font-display font-bold text-xl text-white">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Participant list */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest mb-4">
            참여자 현황 ({participants.length}명)
          </h2>

          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">아직 참여자가 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedParticipants.map((p, i) => {
                const pct = Math.round(((p.completedCount || 0) / 25) * 100)
                return (
                  <div key={p.id} className="flex items-center gap-3 bg-ink-700 rounded-xl p-3">
                    <span className="text-gray-500 font-mono text-xs w-5">#{i + 1}</span>
                    <div className="w-9 h-9 rounded-xl bg-ink-600 flex items-center justify-center text-xl shrink-0">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-medium text-sm text-white truncate">{p.nickname}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-ink-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-acid rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-mono shrink-0">
                          {p.completedCount || 0}/25
                        </span>
                      </div>
                    </div>
                    {(p.bingoLines || 0) > 0 && (
                      <div className="text-xs font-bold text-acid bg-acid/10 px-2 py-1 rounded-lg">
                        {p.bingoLines}빙고
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex flex-col gap-3">
          {!isPlaying ? (
            <button
              onClick={handleStart}
              className="btn-primary w-full h-14 text-base flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              게임 시작
            </button>
          ) : (
            <button
              onClick={endGame}
              className="btn-danger w-full h-14 text-base flex items-center justify-center gap-2"
            >
              <StopCircle className="w-5 h-5" />
              게임 강제 종료
            </button>
          )}
        </div>

        {/* Also join as participant */}
        {!isPlaying && (
          <button
            onClick={() => setView('join-room')}
            className="btn-secondary w-full text-sm"
          >
            참여자로도 입장하기
          </button>
        )}
      </div>
    </div>
  )
}
