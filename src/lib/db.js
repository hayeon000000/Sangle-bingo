/**
 * Supabase Data Access Layer
 * ─────────────────────────────────────────────────
 * 사진(base64)은 DB에 저장하지 않습니다.
 * DB: board 셀의 photo 필드는 boolean(찍었는지) 만 저장
 * 실제 이미지는 localStorage 에 유지 → 새로고침 복구용
 */
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// ─── Rooms ────────────────────────────────────────────────────────────────

export async function createRoom({ password, duration, winnerCount, topics }) {
  const id = uuidv4().slice(0, 8).toUpperCase()
  const masterKey = uuidv4()
  const now = Date.now()

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      id,
      password:     password || null,
      duration,
      winner_count: winnerCount,
      topics,
      status:       'waiting',
      master_key:   masterKey,
      created_at:   now,
    })
    .select()
    .single()

  if (error) throw error
  return { row: data, masterKey, id }
}

export async function fetchRoom(roomId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error) throw error
  return dbRoomToState(data)
}

export async function startRoom(roomId) {
  const now = Date.now()
  const { error } = await supabase
    .from('rooms')
    .update({ status: 'playing', started_at: now })
    .eq('id', roomId)

  if (error) throw error
  return now
}

export async function endRoom(roomId) {
  const { error } = await supabase
    .from('rooms')
    .update({ status: 'finished', ended_at: Date.now() })
    .eq('id', roomId)

  if (error) throw error
}

// ─── Participants ─────────────────────────────────────────────────────────

export async function joinRoom({ roomId, nickname, emoji, board }) {
  const id = uuidv4()
  // Strip photos from board before storing in DB
  const boardForDb = stripPhotosFromBoard(board)

  const { data, error } = await supabase
    .from('participants')
    .insert({
      id,
      room_id:         roomId,
      nickname,
      emoji,
      board:           boardForDb,
      completed_count: 0,
      bingo_lines:     0,
      joined_at:       Date.now(),
    })
    .select()
    .single()

  if (error) throw error
  return { ...dbParticipantToState(data), board } // return with full board (photos) for local state
}

export async function fetchParticipants(roomId) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', roomId)
    .order('completed_count', { ascending: false })

  if (error) throw error
  return data.map(dbParticipantToState)
}

export async function updateParticipantBoard(participantId, board, completedCount, bingoLines) {
  const boardForDb = stripPhotosFromBoard(board)

  const { error } = await supabase
    .from('participants')
    .update({
      board:           boardForDb,
      completed_count: completedCount,
      bingo_lines:     bingoLines,
    })
    .eq('id', participantId)

  if (error) throw error
}

// ─── Realtime subscriptions ───────────────────────────────────────────────

/**
 * Subscribe to room status changes (playing / finished)
 * @returns unsubscribe function
 */
export function subscribeRoom(roomId, onChange) {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      (payload) => onChange(dbRoomToState(payload.new))
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Subscribe to participant join / progress updates
 * @returns unsubscribe function
 */
export function subscribeParticipants(roomId, onInsert, onUpdate) {
  const channel = supabase
    .channel(`participants-${roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
      (payload) => onInsert(dbParticipantToState(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
      (payload) => onUpdate(dbParticipantToState(payload.new))
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─── Shape converters ─────────────────────────────────────────────────────

export function dbRoomToState(row) {
  return {
    id:          row.id,
    password:    row.password,
    duration:    row.duration,
    winnerCount: row.winner_count,
    topics:      row.topics,
    status:      row.status,           // 'waiting' | 'playing' | 'finished'
    masterKey:   row.master_key,
    startedAt:   row.started_at,
    endedAt:     row.ended_at,
    createdAt:   row.created_at,
  }
}

export function dbParticipantToState(row) {
  return {
    id:             row.id,
    roomId:         row.room_id,
    nickname:       row.nickname,
    emoji:          row.emoji,
    board:          row.board ?? [],   // no photos — caller merges local photos
    completedCount: row.completed_count,
    bingoLines:     row.bingo_lines,
    joinedAt:       row.joined_at,
  }
}

// ─── Photo storage helpers (localStorage) ────────────────────────────────

const PHOTO_KEY = (participantId, cellIndex) => `pb_photo_${participantId}_${cellIndex}`

export function savePhotoLocally(participantId, cellIndex, dataUrl) {
  try {
    localStorage.setItem(PHOTO_KEY(participantId, cellIndex), dataUrl)
  } catch (e) {
    console.warn('Photo save failed (localStorage full?):', e)
  }
}

export function loadPhotoLocally(participantId, cellIndex) {
  try {
    return localStorage.getItem(PHOTO_KEY(participantId, cellIndex))
  } catch {
    return null
  }
}

export function loadAllPhotosForBoard(participantId, board) {
  return board.map((cell, i) => {
    if (!cell.photo && !cell.completed) return cell
    const photo = loadPhotoLocally(participantId, i)
    return photo ? { ...cell, photo } : cell
  })
}

// ─── Utilities ────────────────────────────────────────────────────────────

// Remove base64 photo data — store only a boolean flag
function stripPhotosFromBoard(board) {
  return board.map(cell => ({
    ...cell,
    photo: cell.photo ? true : null,
  }))
}

// Persist session info for page-reload recovery
const SESSION_KEY = 'pb_session'
export function saveSession(data) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(data)) } catch {}
}
export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}
export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}
