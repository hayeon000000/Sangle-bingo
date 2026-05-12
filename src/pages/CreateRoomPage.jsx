import React, { useState } from 'react'
import { FiArrowLeft, FiPlus, FiX, FiShuffle } from 'react-icons/fi'
import { useGame, DEFAULT_TOPICS } from '../contexts/GameContext'

export default function CreateRoomPage() {
  const { setView, createRoom, state } = useGame()
  const [password, setPassword] = useState('')
  const [duration, setDuration] = useState(30)
  const [winnerCount, setWinnerCount] = useState(3)
  const [topics, setTopics] = useState(DEFAULT_TOPICS.slice(0, 25))
  const [newTopic, setNewTopic] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)

  const handleAddTopic = () => {
    if (!newTopic.trim() || topics.length >= 25) return
    setTopics([...topics, newTopic.trim()])
    setNewTopic('')
  }
  const handleRemoveTopic = (i) => setTopics(topics.filter((_, idx) => idx !== i))
  const handleEditTopic = (i, val) => {
    const u = [...topics]; u[i] = val; setTopics(u)
  }
  const handleShuffle = () =>
    setTopics([...DEFAULT_TOPICS].sort(() => Math.random() - 0.5).slice(0, 25))

  const handleCreate = async () => {
    if (topics.length < 25) { alert(`미션이 25개 필요합니다. (현재: ${topics.length}개)`); return }
    try {
      await createRoom({ password: password || null, duration, winnerCount, topics: topics.slice(0, 25) })
    } catch (e) { alert('방 생성 실패: ' + e.message) }
  }

  const neonStyle = { boxShadow: 'inset 0 0 20px 5px rgba(0, 255, 245, 0.6)' }
  const topComplete = topics.length === 25

  return (
    <div className="min-h-screen w-screen bg-[#20232A] flex flex-col" style={neonStyle}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button
          onClick={() => setView('home')}
          className="w-10 h-10 rounded-full bg-[#313541] border border-[#00FFF5]/30 flex items-center justify-center active:scale-90 transition-all"
        >
          <FiArrowLeft className="w-5 h-5 text-[#00FFF5]" />
        </button>
        <h1 className="text-white font-bold text-xl tracking-wide">방 만들기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-5">

        {/* 기본 설정 */}
        <Section title="기본 설정">
          <FieldLabel>비밀번호 <span className="text-[#00FFF5]/50 text-xs">(선택)</span></FieldLabel>
          <NeonInput
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="없으면 공개방"
            maxLength={20}
          />

          <FieldLabel className="mt-3">제한 시간: <span className="text-[#00FFF5]">{duration}분</span></FieldLabel>
          <input type="range" min={5} max={120} step={5} value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full mt-1 accent-[#00FFF5]" />
          <div className="flex justify-between text-xs text-gray-500 mt-1"><span>5분</span><span>120분</span></div>

          <FieldLabel className="mt-3">우승자 수: <span className="text-[#00FFF5]">{winnerCount}명</span></FieldLabel>
          <input type="range" min={1} max={10} step={1} value={winnerCount}
            onChange={e => setWinnerCount(Number(e.target.value))}
            className="w-full mt-1 accent-[#00FFF5]" />
          <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1명</span><span>10명</span></div>
        </Section>

        {/* 미션 주제 */}
        <Section title="미션 주제">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-bold ${topComplete ? 'text-[#00FFF5]' : 'text-[#ff6b6b]'}`}>
              {topics.length}/25
            </span>
            <button onClick={handleShuffle}
              className="flex items-center gap-1.5 text-xs text-[#00FFF5]/70 border border-[#00FFF5]/30 bg-[#313541] px-3 py-1.5 rounded-full active:scale-95">
              <FiShuffle className="w-3 h-3" /> 기본값 랜덤
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <NeonInput
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
              placeholder="새 미션 추가..."
              maxLength={20}
              disabled={topics.length >= 25}
              className="flex-1"
            />
            <button onClick={handleAddTopic}
              disabled={!newTopic.trim() || topics.length >= 25}
              className="w-10 h-10 rounded-full bg-[#00FFF5] text-[#20232A] flex items-center justify-center active:scale-90 disabled:opacity-40">
              <FiPlus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
            {topics.map((topic, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#2a2d35] border border-[#00FFF5]/10 rounded-xl px-3 py-2">
                <span className="text-[#00FFF5]/40 font-mono text-xs w-5 shrink-0">{i + 1}</span>
                {editingIndex === i ? (
                  <input autoFocus value={topic}
                    onChange={e => handleEditTopic(i, e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={e => e.key === 'Enter' && setEditingIndex(null)}
                    className="flex-1 bg-transparent text-sm outline-none text-white" maxLength={20} />
                ) : (
                  <span className="flex-1 text-sm text-white cursor-pointer" onClick={() => setEditingIndex(i)}>{topic}</span>
                )}
                <button onClick={() => handleRemoveTopic(i)} className="text-gray-600 hover:text-[#ff6b6b] active:scale-90">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* 생성 버튼 */}
        <button
          onClick={handleCreate}
          disabled={topics.length < 25 || state.loading}
          className="w-full bg-[#00FFF5] text-[#20232A] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-base active:scale-95 shadow-lg disabled:opacity-40 transition-all"
          style={{ boxShadow: topics.length === 25 ? '0 0 20px rgba(0,255,245,0.5)' : 'none' }}
        >
          {state.loading ? '생성 중...' : '방 생성하기 🎮'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-[#2a2d35] border border-[#00FFF5]/20 rounded-2xl p-5">
      <p className="text-[#00FFF5] text-xs font-bold uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}

function FieldLabel({ children, className = '' }) {
  return <label className={`block text-gray-400 text-sm mb-1.5 ${className}`}>{children}</label>
}

function NeonInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#20232A] border border-[#00FFF5]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
        focus:outline-none focus:border-[#00FFF5] focus:ring-1 focus:ring-[#00FFF5]/50 transition-colors
        disabled:opacity-40 ${className}`}
    />
  )
}
