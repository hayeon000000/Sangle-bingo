import React from 'react'
import { X, Camera } from 'lucide-react'

export default function PhotoModal({ cell, onClose, onRetake, isGameActive }) {
  const date = cell.timestamp ? new Date(cell.timestamp) : null
  const dateStr = date
    ? `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
    : null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 modal-backdrop flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-semibold text-white">{cell.topic}</h3>
            {dateStr && <p className="text-xs text-gray-400 font-mono mt-0.5">{dateStr}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Photo */}
        <img
          src={cell.photo}
          alt={cell.topic}
          className="w-full aspect-square object-cover rounded-2xl"
        />

        {/* Retake button */}
        {isGameActive && (
          <button
            onClick={onRetake}
            className="btn-secondary w-full mt-3 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            다시 촬영
          </button>
        )}
      </div>
    </div>
  )
}
