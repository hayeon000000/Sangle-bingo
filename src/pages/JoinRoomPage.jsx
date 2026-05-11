import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useGame } from '../contexts/GameContext'

const EMOJIS = ['📸', '🎯', '🦊', '🐼', '🌸', '⚡', '🎨', '🚀', '🌈', '🦋', '🍀', '🔥', '🌙', '⭐', '🎸', '🎪', '🦁', '🐯', '🦄', '🎭']

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

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 px-4 py-4 flex items-center gap-3">
        <button onClick={() => setView('home')} className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-semibold text-lg">방 참여하기</h1>
      </div>

      <div className="max-w-sm mx-auto w-full px-4 pt-8 flex flex-col gap-6">
        <div className="card p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-acid text-sm uppercase tracking-widest">방 정보</h2>
          <div>
            <label className="label">방 코드</label>
            <input type="text" value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} className="input-field font-mono tracking-widest text-center text-xl uppercase" placeholder="XXXXXXXX" maxLength={8} />
          </div>
          <div>
            <label className="label">비밀번호 (있는 경우)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="비밀번호 입력" />
          </div>
        </div>

        <div className="card p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-acid text-sm uppercase tracking-widest">프로필 설정</h2>
          <div>
            <label className="label">닉네임</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="input-field" placeholder="사용할 닉네임" maxLength={12} />
          </div>
          <div>
            <label className="label">이모지 프로필</label>
            <div className="grid grid-cols-10 gap-1.5">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} className={`text-xl aspect-square rounded-lg flex items-center justify-center transition-all active:scale-90 ${emoji === e ? 'bg-acid/20 ring-2 ring-acid scale-110' : 'bg-ink-700 hover:bg-ink-600'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-ink-700 rounded-xl p-3">
            <div className="w-12 h-12 rounded-xl bg-ink-600 flex items-center justify-center text-2xl">{emoji}</div>
            <div>
              <div className="font-display font-semibold text-white">{nickname || '닉네임'}</div>
              <div className="text-xs text-gray-500">프리뷰</div>
            </div>
          </div>
        </div>

        {error && <div className="bg-coral/10 border border-coral/30 rounded-xl px-4 py-3 text-coral text-sm">{error}</div>}

        <button onClick={handleJoin} disabled={!roomId.trim() || !nickname.trim() || state.isLoading} className="btn-primary w-full h-14 text-base">
          {state.isLoading ? '입장 중...' : '입장하기 🚀'}
        </button>
      </div>
    </div>
  )
}