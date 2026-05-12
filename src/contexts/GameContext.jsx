import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const GameContext = createContext(null)

// ─── Default mission topics ────────────────────────────────────────────
export const DEFAULT_TOPICS = [
  '하늘 반사', '그림자 패턴', '대칭 구도', '노란색 물체', '원형 구도',
  '손 클로즈업', '텍스처 표면', '역광 실루엣', '창문과 빛', '녹색 식물',
  '빨간 점 찾기', '움직임 블러', '물 반사', '도시 디테일', '사람의 뒷모습',
  '미니멀 구도', '패턴 반복', '파란색 계열', '오래된 것', '새로운 것',
  '높은 곳에서', '낮은 곳에서', '프레임 속 프레임', '빛과 어둠', '숫자 찾기'
]

const STORAGE_KEY = 'photo_bingo_state'

// ─── Reducer ────────────────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload }

    case 'CREATE_ROOM': {
      const room = {
        id: uuidv4().slice(0, 8).toUpperCase(),
        ...action.payload,
        createdAt: Date.now(),
        status: 'waiting', // waiting | playing | finished
        participants: {},
        masterKey: uuidv4(),
      }
      return {
        ...state,
        room,
        isMaster: true,
        view: 'master-lobby',
      }
    }

    case 'JOIN_ROOM': {
      const { participant, shuffledTopics } = action.payload
      const updatedRoom = {
        ...state.room,
        participants: {
          ...state.room.participants,
          [participant.id]: participant,
        },
      }
      return {
        ...state,
        room: updatedRoom,
        currentParticipant: participant,
        myBoard: shuffledTopics,
        view: 'game',
      }
    }

    case 'SET_ROOM':
      return { ...state, room: action.payload }

    case 'START_GAME': {
      const updatedRoom = { ...state.room, status: 'playing', startedAt: Date.now() }
      return { ...state, room: updatedRoom }
    }

    case 'UPDATE_CELL': {
      const { cellIndex, photo, timestamp } = action.payload
      const newBoard = [...state.myBoard]
      newBoard[cellIndex] = {
        ...newBoard[cellIndex],
        completed: true,
        photo,
        timestamp,
      }
      // Update participant in room
      const updatedParticipant = {
        ...state.currentParticipant,
        completedCount: newBoard.filter(c => c.completed).length,
        board: newBoard,
        bingoLines: calcBingoLines(newBoard),
      }
      const updatedRoom = {
        ...state.room,
        participants: {
          ...state.room.participants,
          [state.currentParticipant.id]: updatedParticipant,
        },
      }
      return {
        ...state,
        myBoard: newBoard,
        currentParticipant: updatedParticipant,
        room: updatedRoom,
      }
    }

    case 'UPDATE_PARTICIPANT': {
      const updatedRoom = {
        ...state.room,
        participants: {
          ...state.room.participants,
          [action.payload.id]: action.payload,
        },
      }
      return { ...state, room: updatedRoom }
    }

    case 'END_GAME': {
      const updatedRoom = { ...state.room, status: 'finished', endedAt: Date.now() }
      return { ...state, room: updatedRoom, view: 'results' }
    }

    case 'RESET':
      return initialState

    case 'HYDRATE':
      return { ...action.payload }

    default:
      return state
  }
}

// ─── Helper: calculate bingo lines ──────────────────────────────────────
export function calcBingoLines(board) {
  if (!board || board.length !== 25) return 0
  let lines = 0
  const completed = board.map(c => c.completed)

  // Rows
  for (let r = 0; r < 5; r++) {
    if ([0,1,2,3,4].every(c => completed[r * 5 + c])) lines++
  }
  // Cols
  for (let c = 0; c < 5; c++) {
    if ([0,1,2,3,4].every(r => completed[r * 5 + c])) lines++
  }
  // Diagonals
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

// ─── Shuffle helper ──────────────────────────────────────────────────────
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
    index: idx,
    topic,
    completed: false,
    photo: null,
    timestamp: null,
  }))
}

// ─── Initial state ───────────────────────────────────────────────────────
const initialState = {
  view: 'home', // home | create-room | join-room | master-lobby | game | results
  room: null,
  isMaster: false,
  currentParticipant: null,
  myBoard: null,
}

// ─── Provider ────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Persist to localStorage (excluding large photo data for performance — photos stored separately)
  useEffect(() => {
    try {
      const toSave = {
        ...state,
        // Store board without base64 photo data in main state
        myBoard: state.myBoard?.map(cell => ({
          ...cell,
          photo: cell.photo ? '__has_photo__' : null,
        })),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))

      // Store photos separately
      if (state.myBoard) {
        state.myBoard.forEach((cell, i) => {
          if (cell.photo && cell.photo !== '__has_photo__') {
            localStorage.setItem(`photo_bingo_photo_${i}`, cell.photo)
          }
        })
      }
    } catch (e) {
      console.warn('Storage error:', e)
    }
  }, [state])

  // Rehydrate on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Restore photos
        if (parsed.myBoard) {
          parsed.myBoard = parsed.myBoard.map((cell, i) => {
            if (cell.photo === '__has_photo__') {
              const photo = localStorage.getItem(`photo_bingo_photo_${i}`)
              return { ...cell, photo: photo || null }
            }
            return cell
          })
        }
        dispatch({ type: 'HYDRATE', payload: parsed })
      }
    } catch (e) {
      console.warn('Hydration error:', e)
    }
  }, [])

  const actions = {
    setView: useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), []),
    createRoom: useCallback((settings) => dispatch({ type: 'CREATE_ROOM', payload: settings }), []),
    joinRoom: useCallback((participant, shuffledTopics) => dispatch({
      type: 'JOIN_ROOM', payload: { participant, shuffledTopics }
    }), []),
    setRoom: useCallback((room) => dispatch({ type: 'SET_ROOM', payload: room }), []),
    startGame: useCallback(() => dispatch({ type: 'START_GAME' }), []),
    updateCell: useCallback((cellIndex, photo, timestamp) => dispatch({
      type: 'UPDATE_CELL', payload: { cellIndex, photo, timestamp }
    }), []),
    endGame: useCallback(() => dispatch({ type: 'END_GAME' }), []),
    reset: useCallback(() => {
      // Clear photos from storage
      for (let i = 0; i < 25; i++) {
        localStorage.removeItem(`photo_bingo_photo_${i}`)
      }
      localStorage.removeItem(STORAGE_KEY)
      dispatch({ type: 'RESET' })
    }, []),
  }

  return (
    <GameContext.Provider value={{ state, dispatch, ...actions }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
