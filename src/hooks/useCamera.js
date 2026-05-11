import { useState, useRef, useCallback, useEffect } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [facingMode, setFacingMode] = useState('environment')
  const [capabilities, setCapabilities] = useState(null)

  const startCamera = useCallback(async (facing = 'environment') => {
    try {
      setError(null)
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 1 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Get zoom capabilities
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities?.()
      setCapabilities(caps || null)
      setFacingMode(facing)
      setIsActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError(err.message || '카메라를 시작할 수 없습니다.')
      setIsActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setZoom(1)
  }, [])

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment'
    startCamera(newFacing)
  }, [facingMode, startCamera])

  const applyZoom = useCallback(async (newZoom) => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return

    const clampedZoom = Math.max(1, Math.min(newZoom, capabilities?.zoom?.max || 5))

    try {
      await track.applyConstraints({ advanced: [{ zoom: clampedZoom }] })
      setZoom(clampedZoom)
    } catch {
      // Zoom not supported, fallback handled in UI via CSS scale
      setZoom(clampedZoom)
    }
  }, [capabilities])

  const capturePhoto = useCallback((topicName) => {
    if (!videoRef.current || !isActive) return null

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    const size = Math.min(video.videoWidth, video.videoHeight)

    // Square crop
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')

    // Handle mirroring for front camera
    if (facingMode === 'user') {
      ctx.translate(size, 0)
      ctx.scale(-1, 1)
    }

    // Center crop
    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)

    // Reset transform for watermark
    if (facingMode === 'user') {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    // Watermark: topic name
    if (topicName) {
      const padding = size * 0.03
      const fontSize = Math.max(16, size * 0.04)

      ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`
      const textWidth = ctx.measureText(topicName).width

      // Background pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
      const pillH = fontSize + padding * 2
      const pillW = textWidth + padding * 3
      const pillX = padding
      const pillY = size - pillH - padding
      const r = pillH / 2

      ctx.beginPath()
      ctx.moveTo(pillX + r, pillY)
      ctx.lineTo(pillX + pillW - r, pillY)
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r)
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH)
      ctx.lineTo(pillX + r, pillY + pillH)
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r)
      ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY)
      ctx.fill()

      // Text
      ctx.fillStyle = '#c8f135'
      ctx.fillText(topicName, pillX + padding * 1.5, pillY + fontSize + padding * 0.5)
    }

    return canvas.toDataURL('image/jpeg', 0.85)
  }, [isActive, facingMode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return {
    videoRef,
    isActive,
    error,
    zoom,
    facingMode,
    capabilities,
    startCamera,
    stopCamera,
    flipCamera,
    applyZoom,
    capturePhoto,
  }
}
