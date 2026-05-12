import React from 'react'
import { FiX, FiCamera } from 'react-icons/fi'

export default function PhotoModal({ cell, onClose, onRetake, isGameActive }) {
  const date = cell.timestamp ? new Date(cell.timestamp) : null
  const dateStr = date
    ? `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white" style={{ textShadow: '0 0 8px rgba(0,255,245,0.4)' }}>{cell.topic}</h3>
            {dateStr && <p className="text-xs text-gray-400 font-mono mt-0.5">{dateStr}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center active:scale-90">
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        <img src={cell.photo} alt={cell.topic}
          className="w-full aspect-square object-cover rounded-2xl"
          style={{ border: '2px solid rgba(0,255,245,0.3)', boxShadow: '0 0 20px rgba(0,255,245,0.2)' }} />

        {isGameActive && (
          <button onClick={onRetake}
            className="w-full mt-3 bg-[#313541] text-[#00FFF5] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm border border-[#00FFF5]/30 active:scale-95">
            <FiCamera className="w-4 h-4" /> 다시 촬영
          </button>
        )}
      </div>
    </div>
  )
}
