import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(durationMinutes, onExpire) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const durationRef = useRef(durationMinutes * 60)

  const start = useCallback((startedAt) => {
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const remaining = Math.max(0, durationRef.current - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        onExpire?.()
        return
      }
    }
    startTimeRef.current = startedAt || Date.now()
    setIsRunning(true)
  }, [onExpire])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, durationRef.current - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        setIsRunning(false)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = durationMinutes > 0 ? (timeLeft / (durationMinutes * 60)) : 1
  const isUrgent = timeLeft <= 60 && timeLeft > 0

  return { timeLeft, formatted, progress, isUrgent, start, stop, isRunning }
}
