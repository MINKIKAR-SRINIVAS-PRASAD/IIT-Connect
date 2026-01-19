import React from 'react'
import { formatTime } from '../../utils/formatters'

export default function MessageBubble({ me, msg, isSeen }) {
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 border text-sm ${
          me
            ? 'bg-indigo-600/20 border-indigo-500/40'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
        <div className="mt-1 flex items-center justify-end gap-2 text-[11px] text-slate-300/80">
          <span>{formatTime(msg.createdAt)}</span>
          {me ? <span>{isSeen ? 'Seen' : 'Sent'}</span> : null}
        </div>
      </div>
    </div>
  )
}
