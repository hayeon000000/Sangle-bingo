import React, { useEffect, useState, useRef } from 'react'
import { X, FlipHorizontal, ZoomIn, ZoomOut, Camera } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'

export default function CameraView({ topic, onCapture, onClose }) {
  const {
    videoRef, isActive, error,
    zoom, capabilities,
    startCamera, stopCamera, flipCamera,
    applyZoom, capturePhoto,
  } = useCamera()

  const [flash, setFlash] = useState(false)
  const [preview, setPreview] = useState(null)
  const touchStartRef = useRef(null)
  const pinchStartDistRef = useRef(null)
  const pinchStartZoomRef = useRef(1)

  useEffect(() => {
    startCamera('environment')
    return () => stopCamera()
  }, [])

  const handleCapture = () => {
    if (!isActive) return
    const photo = capturePhoto(topic)
    if (!photo) return
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
    setPreview(photo)
  }

  const handleConfirm = () => {
    onCapture(preview, Date.now())
    stopCamera()
    onClose()
  }

  const handleRetake = () => {
    setPreview(null)
  }

  // Touch-to-capture (single tap on video)
  const handleVideoTap = (e) => {
    if (e.touches?.length === 1) return // handled via onClick
    handleCapture()
  }

  // Pinch-to-zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      pinchStartDistRef.current = dist
      pinchStartZoomRef.current = zoom
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scale = dist / pinchStartDistRef.current
      applyZoom(pinchStartZoomRef.current * scale)
    }
  }

  const maxZoom = capabilities?.zoom?.max || 5

  return (
    <div className="camera-overlay flex flex-col">
      {/* Flash overlay */}
      {flash && <div className="absolute inset-0 bg-white z-50 animate-fade-in" style={{ animationDuration: '0.1s' }} />}

      {preview ? (
        // Preview mode
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 safe-top">
            <button onClick={handleRetake} className="text-white/80 bg-white/10 px-4 py-2 rounded-xl text-sm font-display active:scale-95">
              다시 찍기
            </button>
            <h2 className="font-display font-semibold text-white">{topic}</h2>
            <button onClick={handleConfirm} className="bg-acid text-ink-950 px-4 py-2 rounded-xl text-sm font-display font-semibold active:scale-95">
              사용하기
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={preview} alt="preview" className="w-full max-w-sm aspect-square object-cover rounded-2xl" />
          </div>
        </div>
      ) : (
        // Camera mode
        <div
          className="relative flex-1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onClick={handleCapture}
        >
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: zoom > 1 && !capabilities?.zoom ? `scale(${zoom})` : 'none' }}
          />

          {/* Dark vignette outside square */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" style={{
            maskImage: `radial-gradient(circle ${Math.min(window.innerWidth * 0.45, window.innerHeight * 0.45)}px at center, transparent 100%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${Math.min(window.innerWidth * 0.45, window.innerHeight * 0.45)}px at center, transparent 100%, black 100%)`,
          }} />

          {/* Square frame guide */}
          <div className="square-frame pointer-events-none">
            <div className="corner-marker tl" />
            <div className="corner-marker tr" />
            <div className="corner-marker bl" />
            <div className="corner-marker br" />
          </div>

          {/* Error */}
          {error && (
            <div className="absolute bottom-20 left-0 right-0 mx-4 bg-coral/90 rounded-xl p-3 text-white text-sm text-center">
              {error}
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute top-0 left-0 right-0 safe-top px-4 pt-2 flex items-center justify-between pointer-events-auto" onClick={e => e.stopPropagation()}>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center active:scale-90"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-display font-semibold text-acid">
              {topic}
            </div>

            <button
              onClick={flipCamera}
              className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center active:scale-90"
            >
              <FlipHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 safe-bottom px-6 pb-4 flex flex-col items-center gap-4 pointer-events-auto" onClick={e => e.stopPropagation()}>
            {/* Zoom slider */}
            <div className="flex items-center gap-3 bg-black/50 rounded-full px-4 py-2">
              <button onClick={() => applyZoom(Math.max(1, zoom - 0.5))} className="active:scale-90">
                <ZoomOut className="w-4 h-4 text-white/70" />
              </button>
              <input
                type="range"
                min={1}
                max={maxZoom}
                step={0.1}
                value={zoom}
                onChange={e => applyZoom(Number(e.target.value))}
                className="w-32 accent-acid"
              />
              <button onClick={() => applyZoom(Math.min(maxZoom, zoom + 0.5))} className="active:scale-90">
                <ZoomIn className="w-4 h-4 text-white/70" />
              </button>
              <span className="text-white/70 font-mono text-xs w-8">{zoom.toFixed(1)}x</span>
            </div>

            {/* Shutter */}
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>

            <p className="text-white/40 text-xs">화면을 탭하거나 버튼을 눌러 촬영</p>
          </div>
        </div>
      )}
    </div>
  )
}
