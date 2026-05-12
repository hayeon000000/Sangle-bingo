import React, { useState } from 'react'
import { FiArrowLeft, FiLogIn } from 'react-icons/fi'
import { useGame } from '../contexts/GameContext'

const EMOJIS = ['📸','🎯','🦊','🐼','🌸','⚡','🎨','🚀','🌈','🦋','🍀','🔥','🌙','⭐','🎸','🎪','🦁','🐯','🦄','🎭']

export default function JoinRoomPage() {
  const { state, setView, joinRoom } = useGame()
  const [roomId, setRoomId] = useState(state.room?.id || '')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
  const [error, setError] = useState('')

  const handleJoin = async () => {
    setError('')
    if (!roomId.trim()) return setError('방 코드를 입력하세요.')
    if (!nickname.trim()) return setError('닉네임을 입력하세요.')
    try {
      await joinRoom(roomId.trim().toUpperCase(), password, nickname.trim(), emoji)
    } catch (err) {
      setError(err.message || '입장 중 오류가 발생했습니다.')
    }
  }

  const neonStyle = { boxShadow: 'inset 0 0 20px 5px rgba(0, 255, 245, 0.6)' }
  const canJoin = roomId.trim() && nickname.trim() && !state.loading

  return (
    <div className="min-h-screen w-screen bg-[#20232A] flex flex-col" style={neonStyle}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button onClick={() => setView('home')}
          className="w-10 h-10 rounded-full bg-[#313541] border border-[#00FFF5]/30 flex items-center justify-center active:scale-90">
          <FiArrowLeft className="w-5 h-5 text-[#00FFF5]" />
        </button>
        <h1 className="text-white font-bold text-xl tracking-wide">방 참여하기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-5">

        {/* 방 정보 */}
        <Section title="방 정보">
          <FieldLabel>방 코드</FieldLabel>
          <input
            type="text" value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            className="w-full bg-[#20232A] border border-[#00FFF5]/30 rounded-xl px-4 py-3 font-mono tracking-[0.3em] text-center text-xl text-white uppercase placeholder-gray-600 focus:outline-none focus:border-[#00FFF5] focus:ring-1 focus:ring-[#00FFF5]/50"
            placeholder="XXXXXXXX" maxLength={8}
          />
          <FieldLabel className="mt-3">비밀번호 <span className="text-[#00FFF5]/50 text-xs">(있는 경우)</span></FieldLabel>
          <NeonInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" />
        </Section>

        {/* 프로필 */}
        <Section title="프로필 설정">
          <FieldLabel>닉네임</FieldLabel>
          <NeonInput value={nickname} onChange={e => setNickname(e.target.value)} placeholder="사용할 닉네임" maxLength={12} />

          <FieldLabel className="mt-4">이모지 프로필</FieldLabel>
          <div className="grid grid-cols-10 gap-1.5 mb-4">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`text-xl aspect-square rounded-xl flex items-center justify-center transition-all active:scale-90
                  ${emoji === e
                    ? 'bg-[#00FFF5]/20 ring-2 ring-[#00FFF5] scale-110'
                    : 'bg-[#20232A] border border-[#00FFF5]/10 hover:border-[#00FFF5]/40'}`}>
                {e}
              </button>
            ))}
          </div>

          {/* 미리보기 */}
          <div className="flex items-center gap-3 bg-[#20232A] border border-[#00FFF5]/20 rounded-xl p-3">
            <div className="w-12 h-12 rounded-xl bg-[#313541] border border-[#00FFF5]/30 flex items-center justify-center text-2xl">{emoji}</div>
            <div>
              <div className="font-bold text-white">{nickname || '닉네임'}</div>
              <div className="text-xs text-gray-500">미리보기</div>
            </div>
          </div>
        </Section>

        {error && (
          <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/50 rounded-xl px-4 py-3 text-[#ff6b6b] text-sm">
            {error}
          </div>
        )}

        <button onClick={handleJoin} disabled={!canJoin}
          className="w-full bg-[#00FFF5] text-[#20232A] font-bold py-3 rounded-full flex items-center justify-center gap-3 text-base active:scale-95 disabled:opacity-40 transition-all"
          style={{ boxShadow: canJoin ? '0 0 20px rgba(0,255,245,0.5)' : 'none' }}>
          <FiLogIn className="w-5 h-5" />
          {state.loading ? '입장 중...' : '입장하기'}
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
    <input {...props}
      className={`w-full bg-[#20232A] border border-[#00FFF5]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm
        focus:outline-none focus:border-[#00FFF5] focus:ring-1 focus:ring-[#00FFF5]/50 transition-colors ${className}`} />
  )
}
