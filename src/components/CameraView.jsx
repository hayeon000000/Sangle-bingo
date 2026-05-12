import React, { useEffect, useState, useRef } from 'react'
import { FiX, FiRefreshCw, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { useCamera } from '../hooks/useCamera'

export default function CameraView({ topic, onCapture, onClose }) {
  const { videoRef, isActive, error, zoom, capabilities, startCamera, stopCamera, flipCamera, applyZoom, capturePhoto } = useCamera()
  const [flash, setFlash] = useState(false)
  const [preview, setPreview] = useState(null)
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
    setTimeout(() => setFlash(false), 120)
    setPreview(photo)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchStartDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      pinchStartZoomRef.current = zoom
    }
  }
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      applyZoom(pinchStartZoomRef.current * (dist / pinchStartDistRef.current))
    }
  }

  const maxZoom = capabilities?.zoom?.max || 5

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 100 }}>
      {/* 플래시 */}
      {flash && <div className="absolute inset-0 bg-white z-50" style={{ animation: 'fadeIn 0.05s ease' }} />}

      {preview ? (
        /* ── 프리뷰 ── */
        <div className="flex flex-col h-full bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-5 pt-10 pb-4">
            <button onClick={() => setPreview(null)}
              className="bg-white/10 border border-white/20 text-white px-5 py-2 rounded-full text-sm font-bold active:scale-90">
              다시 찍기
            </button>
            <div className="font-bold text-sm px-4 py-2 rounded-full border border-[#00FFF5]/50 text-[#00FFF5]"
              style={{ textShadow: '0 0 8px rgba(0,255,245,0.6)' }}>
              {topic}
            </div>
            <button onClick={() => { onCapture(preview, Date.now()); stopCamera(); onClose() }}
              className="font-bold text-sm text-[#20232A] px-5 py-2 rounded-full active:scale-90"
              style={{ background: '#00FFF5', boxShadow: '0 0 15px rgba(0,255,245,0.5)' }}>
              사용하기
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={preview} alt="preview"
              className="w-full max-w-sm aspect-square object-cover rounded-2xl"
              style={{ border: '2px solid rgba(0,255,245,0.4)', boxShadow: '0 0 30px rgba(0,255,245,0.2)' }} />
          </div>
        </div>
      ) : (
        /* ── 카메라 ── */
        <div className="relative flex-1" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onClick={handleCapture}>
          <video ref={videoRef} autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover" />

          {/* 어두운 오버레이 (1:1 프레임 바깥) */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%),
              linear-gradient(to right,  rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)
            `
          }} />

          {/* 1:1 프레임 코너 마커 */}
          <div className="square-frame pointer-events-none">
            <div className="corner-marker tl" style={{ borderColor: '#00FFF5' }} />
            <div className="corner-marker tr" style={{ borderColor: '#00FFF5' }} />
            <div className="corner-marker bl" style={{ borderColor: '#00FFF5' }} />
            <div className="corner-marker br" style={{ borderColor: '#00FFF5' }} />
          </div>

          {/* 에러 */}
          {error && (
            <div className="absolute bottom-24 left-4 right-4 bg-[#ff6b6b]/90 rounded-xl p-3 text-white text-sm text-center">
              {error}
            </div>
          )}

          {/* 상단 컨트롤 */}
          <div className="absolute top-0 left-0 right-0 pt-10 px-5 flex items-center justify-between pointer-events-auto"
            onClick={e => e.stopPropagation()}>
            <button onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center active:scale-90">
              <FiX className="w-5 h-5 text-white" />
            </button>
            <div className="px-4 py-2 rounded-full font-bold text-xs border border-[#00FFF5]/60 text-[#00FFF5] bg-black/50"
              style={{ textShadow: '0 0 8px rgba(0,255,245,0.6)' }}>
              {topic}
            </div>
            <button onClick={(e) => { e.stopPropagation(); flipCamera() }}
              className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center active:scale-90">
              <FiRefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 하단 컨트롤 */}
          <div className="absolute bottom-0 left-0 right-0 pb-10 px-6 flex flex-col items-center gap-5 pointer-events-auto"
            onClick={e => e.stopPropagation()}>
            {/* 줌 */}
            <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-full px-4 py-2.5">
              <button onClick={() => applyZoom(Math.max(1, zoom - 0.5))} className="active:scale-90">
                <FiZoomOut className="w-4 h-4 text-white/70" />
              </button>
              <input type="range" min={1} max={maxZoom} step={0.1} value={zoom}
                onChange={e => applyZoom(Number(e.target.value))}
                className="w-28" style={{ accentColor: '#00FFF5' }} />
              <button onClick={() => applyZoom(Math.min(maxZoom, zoom + 0.5))} className="active:scale-90">
                <FiZoomIn className="w-4 h-4 text-white/70" />
              </button>
              <span className="text-white/60 font-mono text-xs w-8">{zoom.toFixed(1)}x</span>
            </div>

            {/* 셔터 */}
            <button onClick={handleCapture}
              className="w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                border: '3px solid #00FFF5',
                background: 'rgba(0,255,245,0.1)',
                boxShadow: '0 0 20px rgba(0,255,245,0.4), inset 0 0 15px rgba(0,255,245,0.1)'
              }}>
              <div className="w-14 h-14 rounded-full bg-white"
                style={{ boxShadow: '0 0 15px rgba(255,255,255,0.5)' }} />
            </button>
            <p className="text-white/30 text-xs">화면을 탭하거나 버튼을 눌러 촬영</p>
          </div>
        </div>
      )}
    </div>
  )
}
