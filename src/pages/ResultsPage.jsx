import React, { useState } from 'react'
import { Trophy, Sparkles, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { analyzePhotos } from '../utils/gemini'

export default function ResultsPage() {
  const { state, reset } = useGame()
  const { room, currentParticipant, myBoard } = state
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiProgress, setAiProgress] = useState('')
  const [showBoard, setShowBoard] = useState(false)

  const participants = Object.values(room?.participants || {})
  const sorted = [...participants].sort((a, b) => (b.completedCount || 0) - (a.completedCount || 0))
  const winnerCount = room?.winnerCount || 3
  const completedCount = myBoard?.filter(c => c.completed).length || 0
  const completedPhotos = myBoard?.filter(c => c.completed && c.photo) || []

  const handleAiAnalysis = async () => {
    setAiLoading(true)
    setAiError('')
    setAiResult('')
    try {
      const result = await analyzePhotos(
        myBoard,
        currentParticipant?.nickname || '참여자',
        setAiProgress
      )
      setAiResult(result)
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
      setAiProgress('')
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">게임 결과</h1>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            처음으로
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* My summary card */}
        <div className="card p-5 text-center">
          <div className="text-4xl mb-2">{currentParticipant?.emoji}</div>
          <h2 className="font-display font-bold text-xl text-white">{currentParticipant?.nickname}</h2>
          <div className="flex justify-center gap-6 mt-3">
            <div>
              <div className="font-display font-bold text-2xl text-acid">{completedCount}</div>
              <div className="text-xs text-gray-500">완료</div>
            </div>
            <div className="w-px bg-ink-700" />
            <div>
              <div className="font-display font-bold text-2xl text-acid">{state.currentParticipant?.bingoLines || 0}</div>
              <div className="text-xs text-gray-500">빙고</div>
            </div>
            <div className="w-px bg-ink-700" />
            <div>
              <div className="font-display font-bold text-2xl text-acid">
                #{sorted.findIndex(p => p.id === currentParticipant?.id) + 1}
              </div>
              <div className="text-xs text-gray-500">순위</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-acid" />
            최종 순위표
          </h2>
          <div className="flex flex-col gap-2">
            {sorted.map((p, i) => {
              const isCurrentUser = p.id === currentParticipant?.id
              const isWinner = i < winnerCount
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    isWinner ? 'bg-acid/5 border border-acid/20' : 'bg-ink-800'
                  } ${isCurrentUser ? 'ring-2 ring-acid/40' : ''}`}
                >
                  <div className="w-8 text-center shrink-0">
                    {medal ? <span className="text-xl">{medal}</span> : <span className="text-gray-500 font-mono">#{i+1}</span>}
                  </div>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-white">{p.nickname}</span>
                      {isWinner && <Trophy className="w-3.5 h-3.5 text-acid" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.completedCount || 0}칸 완료 · {p.bingoLines || 0}빙고
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Photo grid */}
        {completedPhotos.length > 0 && (
          <div className="card p-5">
            <button
              onClick={() => setShowBoard(!showBoard)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest">
                내 사진 ({completedPhotos.length}장)
              </h2>
              {showBoard ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showBoard && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {completedPhotos.map((cell, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={cell.photo} alt={cell.topic} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      <p className="text-[10px] text-white font-body leading-tight truncate">{cell.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Analysis */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-acid" />
            <h2 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest">AI 성향 분석</h2>
          </div>

          {!aiResult && !aiLoading && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-4">
                내가 찍은 {completedPhotos.length}장의 사진을 AI가 분석해드려요
              </p>
              <button
                onClick={handleAiAnalysis}
                disabled={completedPhotos.length === 0}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                AI 분석 시작
              </button>
              {import.meta.env.VITE_GEMINI_API_KEY ? null : (
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ VITE_GEMINI_API_KEY 환경 변수를 설정하세요
                </p>
              )}
            </div>
          )}

          {aiLoading && (
            <div className="text-center py-6">
              <div className="w-10 h-10 border-2 border-acid border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-acid text-sm font-display">{aiProgress || '분석 중...'}</p>
            </div>
          )}

          {aiError && (
            <div className="bg-coral/10 border border-coral/30 rounded-xl p-4">
              <p className="text-coral text-sm">{aiError}</p>
              <button onClick={handleAiAnalysis} className="text-xs text-gray-400 hover:text-white mt-2 underline">
                다시 시도
              </button>
            </div>
          )}

          {aiResult && (
            <div className="bg-ink-700 rounded-xl p-4">
              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-body">
                {aiResult}
              </div>
              <button
                onClick={handleAiAnalysis}
                className="text-xs text-gray-500 hover:text-acid mt-3 underline"
              >
                다시 분석
              </button>
            </div>
          )}
        </div>

        <button
          onClick={reset}
          className="btn-secondary w-full h-12 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          새 게임 시작
        </button>
      </div>
    </div>
  )
}
