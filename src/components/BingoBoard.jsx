import React, { useState, useCallback } from 'react'
import { getBingoLineIndices } from '../contexts/GameContext'
import CameraView from './CameraView'
import PhotoModal from './PhotoModal'

export default function BingoBoard({ board, onCellCapture, isGameActive }) {
  const [cameraCell, setCameraCell] = useState(null)
  const [viewingCell, setViewingCell] = useState(null)

  const bingoIndices = getBingoLineIndices(board)
  const bingoSet = new Set(bingoIndices.flat())

  const handleCellClick = (cell, index) => {
    if (!isGameActive) return
    if (cell.completed) setViewingCell(index)
    else setCameraCell(index)
  }

  const handleCapture = useCallback((photo, timestamp) => {
    if (cameraCell !== null) {
      onCellCapture(cameraCell, photo, timestamp)
      setCameraCell(null)
    }
  }, [cameraCell, onCellCapture])

  return (
    <>
      <div className="grid grid-cols-5 gap-1.5 w-full">
        {board.map((cell, i) => {
          const isBingo = bingoSet.has(i)
          const isDone = cell.completed

          return (
            <button key={i} onClick={() => handleCellClick(cell, i)}
              className="relative aspect-square rounded-xl overflow-hidden active:scale-95 select-none transition-all duration-200"
              style={{
                border: isBingo
                  ? '2px solid #00FFF5'
                  : isDone
                    ? '1px solid rgba(0,255,245,0.3)'
                    : '1px solid rgba(0,255,245,0.12)',
                background: isDone ? 'transparent' : '#2a2d35',
                boxShadow: isBingo ? '0 0 12px rgba(0,255,245,0.5), inset 0 0 8px rgba(0,255,245,0.1)' : 'none',
              }}>

              {isDone && cell.photo ? (
                <>
                  <img src={cell.photo} alt={cell.topic} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  {isBingo && <div className="absolute inset-0 bg-[#00FFF5]/15" />}
                  {isBingo && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00FFF5] flex items-center justify-center"
                      style={{ boxShadow: '0 0 6px rgba(0,255,245,0.8)' }}>
                      <span className="text-[#20232A] text-[8px] font-black">✓</span>
                    </div>
                  )}
                </>
              ) : isDone ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#00FFF5]/10">
                  <span className="text-[#00FFF5] text-2xl" style={{ textShadow: '0 0 10px rgba(0,255,245,0.8)' }}>✓</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 gap-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-[#00FFF5]/20 flex items-center justify-center mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFF5]/20" />
                  </div>
                  <span className="text-[9px] text-gray-500 text-center leading-tight line-clamp-2 px-0.5">
                    {cell.topic}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {cameraCell !== null && (
        <div className="fixed inset-0 z-50">
          <CameraView
            topic={board[cameraCell]?.topic}
            onCapture={handleCapture}
            onClose={() => setCameraCell(null)}
          />
        </div>
      )}

      {viewingCell !== null && board[viewingCell]?.photo && (
        <PhotoModal
          cell={board[viewingCell]}
          onClose={() => setViewingCell(null)}
          onRetake={() => { setViewingCell(null); if (isGameActive) setCameraCell(viewingCell) }}
          isGameActive={isGameActive}
        />
      )}
    </>
  )
}
