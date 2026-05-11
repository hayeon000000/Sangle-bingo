import React, { useState, useEffect } from 'react'
import { Trophy, Sparkles, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useGame, calcBingoLines } from '../contexts/GameContext'
import { verifyBoardPhotos } from '../utils/gemini'
import * as db from '../lib/db' // 수동 업데이트를 위해 import

// 진짜 점수 계산 함수 (통과 +10점, 빙고 +50점, 탈락 -5점)
function calculateRealScore(board) {
  let score = 0;
  let validCount = 0;
  
  // 패스 여부를 적용한 가상의 보드 생성 (검증 안 된 건 일단 통과로 간주)
  const evaluatedBoard = board.map(cell => ({
    ...cell,
    isValid: cell.completed && cell.aiPassed !== false
  }));

  evaluatedBoard.forEach(cell => {
    if (cell.completed) {
      if (cell.aiPassed === false) score -= 5; // 패널티
      else {
        score += 10;
        validCount += 1;
      }
    }
  });

  // 유효한 칸으로만 빙고 계산
  let realBingo = 0;
  const isV = evaluatedBoard.map(c => c.isValid);
  for (let r=0; r<5; r++) if ([0,1,2,3,4].every(c => isV[r*5+c])) realBingo++;
  for (let c=0; c<5; c++) if ([0,1,2,3,4].every(r => isV[r*5+c])) realBingo++;
  if ([0,6,12,18,24].every(i => isV[i])) realBingo++;
  if ([4,8,12,16,20].every(i => isV[i])) realBingo++;

  score += (realBingo * 50);

  return { realScore: score, realBingo, validCount };
}

export default function ResultsPage() {
  const { state, reset } = useGame()
  const { room, currentParticipant, myBoard } = state
  
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyProgress, setVerifyProgress] = useState('')
  const [hasVerified, setHasVerified] = useState(false)

  // 모든 참가자의 실시간 '진짜 점수' 계산
  const participants = Object.values(room?.participants || {}).map(p => {
    const stats = calculateRealScore(p.board || []);
    return { ...p, ...stats };
  });

  // 진짜 점수 기준으로 정렬
  const sorted = [...participants].sort((a, b) => b.realScore - a.realScore);
  const myData = sorted.find(p => p.id === currentParticipant?.id);
  const myRank = sorted.findIndex(p => p.id === currentParticipant?.id) + 1;

  // 내 AI 심사 시작
  const handleVerifyMe = async () => {
    if (hasVerified || !myBoard) return;
    setIsVerifying(true);
    setVerifyProgress('사진 제출 중...');

    try {
      // 1. Gemini로 내 사진 진위 여부 파악
      const results = await verifyBoardPhotos(myBoard, setVerifyProgress);
      
      // 2. 내 로컬 보드에 결과 병합
      const updatedBoard = myBoard.map(cell => {
        const match = results.find(r => r.index === cell.index);
        if (match) return { ...cell, aiPassed: match.passed, aiReason: match.reason };
        return cell;
      });

      setVerifyProgress('최종 점수 집계 중...');

      // 3. DB에 내 정보 업데이트 (그러면 모든 사람의 Realtime 화면에서 내 순위가 움직임!)
      await db.updateParticipantBoard(
        currentParticipant.id, 
        updatedBoard, 
        currentParticipant.completedCount, 
        currentParticipant.bingoLines
      );

      setHasVerified(true);
    } catch (err) {
      alert("심사 중 오류가 났어! 다시 시도해봐: " + err.message);
    } finally {
      setIsVerifying(false);
      setVerifyProgress('');
    }
  }

  // 이미 검증된 상태인지 확인 (새로고침 시)
  useEffect(() => {
    if (myBoard && myBoard.some(c => c.aiPassed !== undefined)) {
      setHasVerified(true);
    }
  }, [myBoard]);

  return (
    <div className="min-h-screen bg-ink-950 pb-10">
      <div className="sticky top-0 z-10 bg-ink-950/95 backdrop-blur-sm border-b border-ink-700 px-4 py-4 flex justify-between">
        <h1 className="font-display font-bold text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-acid" /> 심판의 시간
        </h1>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-white">나가기</button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
        
        {/* 심사 받기 버튼 영역 */}
        {!hasVerified ? (
          <div className="card p-6 text-center border-coral/50 bg-coral/5">
            <AlertTriangle className="w-10 h-10 text-coral mx-auto mb-3" />
            <h2 className="font-display font-bold text-lg mb-1">스피드런 꼼수 단속반 출동!</h2>
            <p className="text-sm text-gray-400 mb-4 break-keep">
              아무거나 찍었는지 AI가 매의 눈으로 심사합니다.<br/>거짓 사진은 -5점, 진짜 빙고만 인정됩니다.
            </p>
            <button 
              onClick={handleVerifyMe} 
              disabled={isVerifying}
              className="btn-danger w-full h-12 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isVerifying ? verifyProgress : '내 사진 AI 심사받기'}
            </button>
          </div>
        ) : (
          <div className="card p-6 text-center border-acid/50 bg-acid/5">
            <div className="text-4xl mb-2">{myData?.emoji}</div>
            <h2 className="font-display font-bold text-xl text-white">최종 내 점수: {myData?.realScore}점</h2>
            <div className="flex justify-center gap-4 mt-3 text-sm text-gray-400">
              <span>통과: <span className="text-white">{myData?.validCount}장</span></span>
              <span>최종 빙고: <span className="text-acid">{myData?.realBingo}줄</span></span>
              <span>순위: <span className="text-white">{myRank}위</span></span>
            </div>
          </div>
        )}

        {/* 심사 후 적발된 사진 갤러리 */}
        {hasVerified && myData?.board && (
          <div className="card p-4">
            <h3 className="font-display font-semibold text-sm mb-3">내 판독 결과</h3>
            <div className="grid grid-cols-5 gap-1">
              {myData.board.map((cell, i) => {
                if (!cell.completed || !cell.photo) return <div key={i} className="aspect-square bg-ink-800 rounded-md" />;
                const isPassed = cell.aiPassed !== false;
                
                return (
                  <div key={i} className={`relative aspect-square rounded-md overflow-hidden border-2 ${isPassed ? 'border-acid/30' : 'border-coral'}`}>
                    <img src={cell.photo} alt={cell.topic} className="w-full h-full object-cover opacity-80" />
                    {!isPassed && (
                      <div className="absolute inset-0 bg-coral/40 flex flex-col items-center justify-center p-1 text-center">
                        <XCircle className="w-5 h-5 text-white mb-1 drop-shadow-md" />
                        <span className="text-[8px] text-white font-bold leading-tight drop-shadow-md">{cell.aiReason}</span>
                      </div>
                    )}
                    {isPassed && cell.aiPassed === true && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="w-3 h-3 text-acid bg-ink-950 rounded-full" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 실시간 찐 순위표 */}
        <div className="card p-5 transition-all duration-500">
          <h2 className="font-display font-semibold text-sm text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>실시간 진짜 순위표</span>
          </h2>
          <div className="flex flex-col gap-2 relative">
            {sorted.map((p, i) => {
              const isMe = p.id === currentParticipant?.id;
              const hasBeenVerified = p.board?.some(c => c.aiPassed !== undefined);

              return (
                <div key={p.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-transform duration-500 ${isMe ? 'bg-acid/10 border border-acid/30' : 'bg-ink-800'}`}>
                  <div className="w-6 text-center font-mono text-gray-500 text-sm">#{i+1}</div>
                  <span className="text-2xl relative">
                    {p.emoji}
                    {hasBeenVerified && <Sparkles className="w-3 h-3 text-acid absolute -top-1 -right-1" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-white truncate">{p.nickname}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {hasBeenVerified ? (
                        <span className="text-acid">{p.realBingo}빙고 · {p.realScore}점</span>
                      ) : (
                        <span>심사 대기중... (가점수: {p.realScore})</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}