import React, { useState } from 'react'
import { ArrowLeft, Plus, X, Shuffle } from 'lucide-react'
import { useGame, DEFAULT_TOPICS } from '../contexts/GameContext'

export default function CreateRoomPage() {
  const { setView, createRoom } = useGame()

  const [password, setPassword] = useState('')
  const [duration, setDuration] = useState(30)
  const [winnerCount, setWinnerCount] = useState(3)
  const [topics, setTopics] = useState(DEFAULT_TOPICS.slice(0, 25))
  const [newTopic, setNewTopic] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)

  const handleAddTopic = () => {
    if (!newTopic.trim()) return
    if (topics.length >= 25) return
    setTopics([...topics, newTopic.trim()])
    setNewTopic('')
  }

  const handleRemoveTopic = (i) => {
    setTopics(topics.filter((_, idx) => idx !== i))
  }

  const handleEditTopic = (i, val) => {
    const updated = [...topics]
    updated[i] = val
    setTopics(updated)
  }

  const handleShuffle = () => {
    setTopics([...DEFAULT_TOPICS].sort(() => Math.random() - 0.5).slice(0, 25))
  }

  const handleCreate = () => {
    if (topics.length < 25) {
      alert(`미션이 25개 필요합니다. (현재: ${topics.length}개)`)
      return
    }
    createRoom({
      password: password || null,
      duration,
      winnerCount,
      topics: topics.slice(0, 25),
    })
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => setView('home')}
          className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-semibold text-lg">방 만들기</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Basic settings */}
        <div className="card p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-acid text-sm uppercase tracking-widest">기본 설정</h2>

          <div>
            <label className="label">비밀번호 (선택)</label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="입력 안 하면 공개방"
              maxLength={20}
            />
          </div>

          <div>
            <label className="label">제한 시간: <span className="text-white">{duration}분</span></label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-acid mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5분</span><span>120분</span>
            </div>
          </div>

          <div>
            <label className="label">우승자 수: <span className="text-white">{winnerCount}명</span></label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={winnerCount}
              onChange={e => setWinnerCount(Number(e.target.value))}
              className="w-full accent-acid mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1명</span><span>10명</span>
            </div>
          </div>
        </div>

        {/* Mission topics */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-acid text-sm uppercase tracking-widest">미션 주제</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className={topics.length === 25 ? 'text-acid' : 'text-coral'}>{topics.length}</span>/25개
              </p>
            </div>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-ink-700 px-3 py-1.5 rounded-lg active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" />
              기본값 랜덤
            </button>
          </div>

          {/* Add topic */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              className="input-field flex-1 text-sm"
              placeholder="새 미션 추가..."
              maxLength={20}
              disabled={topics.length >= 25}
            />
            <button
              onClick={handleAddTopic}
              disabled={!newTopic.trim() || topics.length >= 25}
              className="btn-primary px-3 py-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Topics grid */}
          <div className="grid grid-cols-1 gap-1.5 max-h-80 overflow-y-auto pr-1">
            {topics.map((topic, i) => (
              <div key={i} className="flex items-center gap-2 bg-ink-700 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500 font-mono w-5 shrink-0">{i + 1}</span>
                {editingIndex === i ? (
                  <input
                    autoFocus
                    value={topic}
                    onChange={e => handleEditTopic(i, e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={e => e.key === 'Enter' && setEditingIndex(null)}
                    className="flex-1 bg-transparent text-sm outline-none text-white"
                    maxLength={20}
                  />
                ) : (
                  <span
                    className="flex-1 text-sm text-white cursor-pointer"
                    onClick={() => setEditingIndex(i)}
                  >
                    {topic}
                  </span>
                )}
                <button
                  onClick={() => handleRemoveTopic(i)}
                  className="text-gray-600 hover:text-coral active:scale-90"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={topics.length < 25}
          className="btn-primary w-full h-14 text-base"
        >
          방 생성하기 🎮
        </button>
      </div>
    </div>
  )
}
