import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import * as db from '../lib/db'

const GameContext = createContext(null)

export const DEFAULT_TOPICS = [
  '하늘 반사', '그림자 패턴', '대칭 구도', '노란색 물체', '원형 구도',
  '손 클로즈업', '텍스처 표면', '역광 실루엣', '창문과 빛', '녹색 식물',
  '빨간 점 찾기', '움직임 블러', '물 반사', '도시 디테일', '사람의 뒷모습',
  '미니멀 구도', '패턴 반복', '파란색 계열', '오래된 것', '새로운 것',
  '높은 곳에서', '낮은 곳에서', '프레임 속 프레임', '빛과 어둠', '숫자 찾기'
]

export function calcBingoLines(board) {
  if (!board || board.length !== 25) return 0
  let lines = 0
  const completed = board.map(c => c.completed)
  for (let r = 0; r < 5; r++) if ([0,1,2,3,4].every(c => completed[r * 5 + c])) lines++
  for (let c = 0; c < 5; c++) if ([0,1,2,3,4].every(r => completed[r * 5 + c])) lines++
  if ([0,6,12,18,24].every(i => completed[i])) lines++
  if ([4,8,12,16,20].every(i => completed[i])) lines++
  return lines
}

export function getBingoLineIndices(board) {
  if (!board || board.length !== 25) return []
  const completed = board.map(c => c.completed)
  const lines = []
  for (let r = 0; r < 5; r++) {
    const indices = [0,1,2,3,4].map(c => r * 5 + c)
    if (indices.every(i => completed[i])) lines.push(indices)
  }
  for (let c = 0; c < 5; c++) {
    const indices = [0,1,2,3,4].map(r => r * 5 + c)
    if (indices.every(i => completed[i])) lines.push(indices)
  }
  const diag1 = [0,6,12,18,24]
  const diag2 = [4,8,12,16,20]
  if (diag1.every(i => completed[i])) lines.push(diag1)
  if (diag2.every(i => completed[i])) lines.push(diag2)
  return lines
}

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildBoard(topics) {
  return topics.map((topic, idx) => ({
    index: idx, topic, completed: false, photo: null, timestamp: null,
  }))
}

export function GameProvider({ children }) {
  const [state, setState] = useState({
    view: 'home',
    room: null,
    isMaster: false,
    currentParticipant: null,
    myBoard: null,
    loading: false, // 🌟 클로드의 새 UI와 호환되도록 이름 변경
  })

  // 새로고침 시 세션 복구
  useEffect(() => {
    const session = db.loadSession()
    if (session) {
      const restoredBoard = session.currentParticipant 
        ? db.loadAllPhotosForBoard(session.currentParticipant.id, session.currentParticipant.board)
        : null
        
      setState(prev => ({
        ...prev,
        ...session,
        myBoard: restoredBoard
      }))
    }
  }, [])

  // 상태 변경 시 세션 저장
  useEffect(() => {
    const { view, room, isMaster, currentParticipant } = state
    db.saveSession({ view, room, isMaster, currentParticipant })
  }, [state.view, state.room, state.isMaster, state.currentParticipant])

  // Realtime 구독 (실시간 멀티플레이어 동기화)
  useEffect(() => {
    const roomId = state.room?.id
    if (!roomId) return

    const unsubRoom = db.subscribeRoom(roomId, (updatedRoom) => {
      setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, ...updatedRoom } : null,
        view: updatedRoom.status === 'finished' ? 'results' : prev.view
      }))
    })

    const unsubParts = db.subscribeParticipants(
      roomId,
      (newPart) => setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, participants: { ...prev.room.participants, [newPart.id]: newPart } } : null
      })),
      (updatedPart) => setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, participants: { ...prev.room.participants, [updatedPart.id]: updatedPart } } : null
      }))
    )

    return () => {
      unsubRoom()
      unsubParts()
    }
  }, [state.room?.id])

  // Actions
  const setView = useCallback((view) => setState(p => ({ ...p, view })), [])

  const createRoom = useCallback(async (settings) => {
    setState(p => ({ ...p, loading: true }))
    try {
      const { row, masterKey, id } = await db.createRoom(settings)
      setState(p => ({
        ...p,
        room: { ...db.dbRoomToState(row), participants: {} },
        isMaster: true,
        view: 'master-lobby',
        loading: false
      }))
    } catch (e) {
      setState(p => ({ ...p, loading: false }))
      throw e
    }
  }, [])

  const joinRoom = useCallback(async (roomId, password, nickname, emoji) => {
    setState(p => ({ ...p, loading: true }))
    try {
      const fetchedRoom = await db.fetchRoom(roomId)
      if (fetchedRoom.password && fetchedRoom.password !== password) throw new Error('비밀번호가 틀렸습니다.')
      if (fetchedRoom.status === 'finished') throw new Error('이미 종료된 게임입니다.')

      const partsList = await db.fetchParticipants(roomId)
      const participantsDict = partsList.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
      
      const shuffledTopics = buildBoard(shuffleArray(fetchedRoom.topics))
      const { board, ...participantInfo } = await db.joinRoom({
        roomId, nickname, emoji, board: shuffledTopics
      })

      setState(p => ({
        ...p,
        room: { ...fetchedRoom, participants: participantsDict },
        currentParticipant: participantInfo,
        myBoard: shuffledTopics,
        view: 'game',
        loading: false
      }))
    } catch (e) {
      setState(p => ({ ...p, loading: false }))
      throw e
    }
  }, [])

  const startGame = useCallback(async () => {
    if (!state.room?.id) return
    await db.startRoom(state.room.id)
  }, [state.room?.id])

  const endGame = useCallback(async () => {
    if (!state.room?.id) return
    await db.endRoom(state.room.id)
  }, [state.room?.id])

  const updateCell = useCallback(async (cellIndex, photo, timestamp) => {
    const { myBoard, currentParticipant } = state
    if (!myBoard || !currentParticipant) return

    const newBoard = [...myBoard]
    newBoard[cellIndex] = { ...newBoard[cellIndex], completed: true, photo, timestamp }
    
    const completedCount = newBoard.filter(c => c.completed).length
    const bingoLines = calcBingoLines(newBoard)

    const updatedParticipant = { ...currentParticipant, board: newBoard, completedCount, bingoLines }

    // 로컬 상태 즉시 업데이트
    setState(p => ({
      ...p,
      myBoard: newBoard,
      currentParticipant: updatedParticipant
    }))

    // 로컬 스토리지 및 DB 동기화
    db.savePhotoLocally(currentParticipant.id, cellIndex, photo)
    try {
      await db.updateParticipantBoard(currentParticipant.id, newBoard, completedCount, bingoLines)
    } catch (e) {
      console.error('DB Sync failed', e)
    }
  }, [state])

  const reset = useCallback(() => {
    db.clearSession()
    setState({ view: 'home', room: null, isMaster: false, currentParticipant: null, myBoard: null, loading: false })
  }, [])

  return (
    <GameContext.Provider value={{ state, setView, createRoom, joinRoom, startGame, endGame, updateCell, reset }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}