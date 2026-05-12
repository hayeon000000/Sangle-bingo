import React, { useState, useEffect } from 'react'
import { FiAward, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiXCircle, FiZap } from 'react-icons/fi'
import { useGame, calcBingoLines } from '../contexts/GameContext'
import { verifyBoardPhotos } from '../utils/gemini'
import * as db from '../lib/db'

function calculateRealScore(board) {
  let score = 0, validCount = 0
  const ev = board.map(c => ({ ...c, isValid: c.completed && c.aiPassed !== false }))
  ev.forEach(c => {
    if (c.completed) {
      if (c.aiPassed === false) score -= 5
      else { score += 10; validCount++ }
    }
  })
  const isV = ev.map(c => c.isValid)
  let realBingo = 0
  for (let r=0;r<5;r++) if([0,1,2,3,4].every(c=>isV[r*5+c])) realBingo++
  for (let c=0;c<5;c++) if([0,1,2,3,4].every(r=>isV[r*5+c])) realBingo++
  if([0,6,12,18,24].every(i=>isV[i])) realBingo++
  if([4,8,12,16,20].every(i=>isV[i])) realBingo++
  score += realBingo * 50
  return { realScore: score, realBingo, validCount }
}

export default function ResultsPage() {
  const { state, reset } = useGame()
  const { room, currentParticipant, myBoard } = state
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyProgress, setVerifyProgress] = useState('')
  const [hasVerified, setHasVerified] = useState(false)

  const participants = Object.values(state.participants || {}).map(p => ({
    ...p, ...calculateRealScore(p.board || [])
  }))
  const sorted = [...participants].sort((a, b) => b.realScore - a.realScore)
  const myData = sorted.find(p => p.id === currentParticipant?.id) || 
    { ...calculateRealScore(myBoard || []), emoji: currentParticipant?.emoji, nickname: currentParticipant?.nickname }
  const myRank = sorted.findIndex(p => p.id === currentParticipant?.id) + 1

  useEffect(() => {
    if (myBoard?.some(c => c.aiPassed !== undefined)) setHasVerified(true)
  }, [myBoard])

  const handleVerify = async () => {
    if (hasVerified || !myBoard) return
    setIsVerifying(true); setVerifyProgress('사진 제출 중...')
    try {
      const results = await verifyBoardPhotos(myBoard, setVerifyProgress)
      const updatedBoard = myBoard.map(cell => {
        const match = results.find(r => r.index === cell.index)
        return match ? { ...cell, aiPassed: match.passed, aiReason: match.reason } : cell
      })
      setVerifyProgress('점수 집계 중...')
      await db.updateParticipantBoard(
        currentParticipant.id, updatedBoard,
        currentParticipant.completedCount, currentParticipant.bingoLines
      )
      setHasVerified(true)
    } catch (err) {
      alert('심사 오류: ' + err.message)
    } finally {
      setIsVerifying(false); setVerifyProgress('')
    }
  }

  const neonStyle = { boxShadow: 'inset 0 0 20px 5px rgba(0, 255, 245, 0.6)' }

  return (
    <div className="min-h-screen w-screen bg-[#20232A] flex flex-col" style={neonStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-3">
        <h1 className="font-bold text-xl text-white flex items-center gap-2">
          <FiAward className="w-5 h-5 text-[#00FFF5]" />
          심판의 시간
        </h1>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-[#00FFF5] border border-[#00FFF5]/20 px-3 py-1.5 rounded-full active:scale-95 flex items-center gap-1.5">
          <FiRefreshCw className="w-3 h-3" /> 나가기
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-4">

        {/* AI 심사 카드 */}
        {!hasVerified ? (
          <div className="bg-[#2a1f1f] border border-[#ff6b6b]/40 rounded-2xl p-6 text-center">
            <FiAlertTriangle className="w-10 h-10 text-[#ff6b6b] mx-auto mb-3" />
            <h2 className="font-bold text-lg text-white mb-1">스피드런 꼼수 단속반 출동!</h2>
            <p className="text-sm text-gray-400 mb-4 break-keep leading-relaxed">
              아무거나 찍었는지 AI가 매의 눈으로 심사합니다.<br />
              거짓 사진 <span className="text-[#ff6b6b] font-bold">-5점</span>, 진짜 빙고만 인정!
            </p>
            <button onClick={handleVerify} disabled={isVerifying}
              className="w-full bg-[#ff6b6b] text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              style={{ boxShadow: '0 0 20px rgba(255,107,107,0.4)' }}>
              <FiZap className="w-5 h-5" />
              {isVerifying ? verifyProgress : '내 사진 AI 심사받기'}
            </button>
          </div>
        ) : (
          <div className="bg-[#1a2a1a] border border-[#00FFF5]/40 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">{myData?.emoji}</div>
            <h2 className="font-bold text-xl text-white">최종 점수: <span style={{ color: '#00FFF5', textShadow: '0 0 10px rgba(0,255,245,0.6)' }}>{myData?.realScore}점</span></h2>
            <div className="flex justify-center gap-5 mt-3 text-sm text-gray-400">
              <span>통과: <span className="text-white font-bold">{myData?.validCount}장</span></span>
              <span>빙고: <span className="text-[#00FFF5] font-bold">{myData?.realBingo}줄</span></span>
              <span>순위: <span className="text-white font-bold">{myRank}위</span></span>
            </div>
          </div>
        )}

        {/* 심사 결과 갤러리 */}
        {hasVerified && myBoard && (
          <div className="bg-[#2a2d35] border border-[#00FFF5]/20 rounded-2xl p-4">
            <p className="text-[#00FFF5] text-xs font-bold uppercase tracking-widest mb-3">내 판독 결과</p>
            <div className="grid grid-cols-5 gap-1.5">
              {myBoard.map((cell, i) => {
                if (!cell.completed || !cell.photo) return (
                  <div key={i} className="aspect-square bg-[#20232A] border border-[#00FFF5]/10 rounded-xl" />
                )
                const isPassed = cell.aiPassed !== false
                return (
                  <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isPassed ? 'border-[#00FFF5]/30' : 'border-[#ff6b6b]'}`}>
                    <img src={cell.photo} alt={cell.topic} className="w-full h-full object-cover opacity-80" />
                    {!isPassed && (
                      <div className="absolute inset-0 bg-[#ff6b6b]/50 flex flex-col items-center justify-center p-1 text-center">
                        <FiXCircle className="w-5 h-5 text-white mb-0.5 drop-shadow" />
                        <span className="text-[8px] text-white font-bold leading-tight drop-shadow">{cell.aiReason}</span>
                      </div>
                    )}
                    {isPassed && cell.aiPassed === true && (
                      <div className="absolute top-1 right-1">
                        <FiCheckCircle className="w-3.5 h-3.5 text-[#00FFF5] drop-shadow" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 실시간 순위표 */}
        <div className="bg-[#2a2d35] border border-[#00FFF5]/20 rounded-2xl p-5">
          <p className="text-[#00FFF5] text-xs font-bold uppercase tracking-widest mb-4">실시간 진짜 순위표</p>
          <div className="flex flex-col gap-2">
            {sorted.map((p, i) => {
              const isMe = p.id === currentParticipant?.id
              const verified = p.board?.some(c => c.aiPassed !== undefined)
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
              return (
                <div key={p.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-500 ${
                    isMe ? 'bg-[#00FFF5]/10 border-[#00FFF5]/40' : 'bg-[#20232A] border-[#00FFF5]/10'
                  }`}>
                  <div className="w-7 text-center">
                    {medal ? <span className="text-lg">{medal}</span>
                      : <span className="text-gray-500 font-mono text-sm">#{i+1}</span>}
                  </div>
                  <span className="text-2xl relative">
                    {p.emoji}
                    {verified && <FiZap className="w-3 h-3 text-[#00FFF5] absolute -top-1 -right-1" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{p.nickname}</div>
                    <div className="text-xs mt-0.5">
                      {verified ? (
                        <span className="text-[#00FFF5]">{p.realBingo}빙고 · {p.realScore}점</span>
                      ) : (
                        <span className="text-gray-500">심사 대기중... ({p.realScore}점)</span>
                      )}
                    </div>
                  </div>
                  {isMe && (
                    <span className="text-xs bg-[#00FFF5]/20 text-[#00FFF5] border border-[#00FFF5]/30 px-2 py-0.5 rounded-full font-bold">나</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={reset}
          className="w-full bg-[#313541] text-[#00FFF5] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm border border-[#00FFF5]/30 active:scale-95">
          <FiRefreshCw className="w-4 h-4" /> 새 게임 시작
        </button>
      </div>
    </div>
  )
}
