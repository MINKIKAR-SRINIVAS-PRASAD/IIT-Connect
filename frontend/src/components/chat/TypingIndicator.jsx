import React from 'react'

export default function TypingIndicator({ show }) {
  if (!show) return null
  return (
    <div className="text-xs text-slate-400 flex items-center gap-2">
      <span className="inline-flex gap-1">
        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" />
      </span>
      Typing...
    </div>
  )
}
