import React, { useState, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { getBingoLineIndices } from '../contexts/GameContext'
import CameraView from './CameraView'
import PhotoModal from './PhotoModal'

export default function BingoBoard({ board, onCellCapture, isGameActive }) {
  const [cameraCell, setCameraCell] = useState(null) // index of cell being photographed
  const [viewingCell, setViewingCell] = useState(null) // index of cell being viewed

  const bingoIndices = getBingoLineIndices(board)
  const bingoSet = new Set(bingoIndices.flat())

  const handleCellClick = (cell, index) => {
    if (!isGameActive) return
    if (cell.completed) {
      setViewingCell(index)
    } else {
      setCameraCell(index)
    }
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
          const isCompleted = cell.completed

          return (
            <button
              key={i}
              onClick={() => handleCellClick(cell, i)}
              className={`
                relative aspect-square rounded-xl overflow-hidden border transition-all duration-200
                active:scale-95 select-none
                ${isCompleted
                  ? isBingo
                    ? 'border-acid ring-2 ring-acid/40 animate-bingo-flash'
                    : 'border-acid/40'
                  : 'border-ink-600 bg-ink-800 hover:border-acid/40 hover:bg-ink-700'
                }
              `}
            >
              {isCompleted && cell.photo ? (
                <>
                  {/* Photo fill */}
                  <img
                    src={cell.photo}
                    alt={cell.topic}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay tint on bingo */}
                  {isBingo && (
                    <div className="absolute inset-0 bg-acid/20" />
                  )}
                  {/* Bingo star */}
                  {isBingo && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-acid flex items-center justify-center">
                      <span className="text-ink-950 text-[8px] font-bold">✓</span>
                    </div>
                  )}
                </>
              ) : isCompleted ? (
                <div className="absolute inset-0 bg-acid/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-acid" />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 gap-0.5">
                  <div className="w-4 h-4 rounded-full border border-ink-500 flex items-center justify-center mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-ink-500" />
                  </div>
                  <span className="text-[9px] text-gray-400 text-center leading-tight font-body line-clamp-2">
                    {cell.topic}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Camera overlay */}
      {cameraCell !== null && (
        <div className="fixed inset-0 z-50">
          <CameraView
            topic={board[cameraCell]?.topic}
            onCapture={handleCapture}
            onClose={() => setCameraCell(null)}
          />
        </div>
      )}

      {/* Photo view modal */}
      {viewingCell !== null && board[viewingCell]?.photo && (
        <PhotoModal
          cell={board[viewingCell]}
          onClose={() => setViewingCell(null)}
          onRetake={() => {
            setViewingCell(null)
            if (isGameActive) setCameraCell(viewingCell)
          }}
          isGameActive={isGameActive}
        />
      )}
    </>
  )
}
