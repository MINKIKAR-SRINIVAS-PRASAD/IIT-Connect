import React from 'react'
import { formatTime } from '../../utils/formatters'

function initials(name = 'Student') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export default function MessageBubble({ me, msg, isSeen, showSender = true }) {
  const sender = msg.sender || (typeof msg.senderId === 'object' ? msg.senderId : null)
  const senderName = sender?.profile?.name || sender?.name || (sender?.role === 'admin' ? 'Admin' : 'Student')
  const photoUrl = sender?.profile?.photoUrl || sender?.photoUrl || ''

  return (
    <div className={`flex w-full items-end gap-2 ${me ? 'justify-end' : 'justify-start'}`}>
      {!me && (
        <div className="mb-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-200">
          {photoUrl ? (
            <img src={photoUrl} alt={senderName} className="h-full w-full object-cover" />
          ) : initials(senderName)}
        </div>
      )}

      <div className={`max-w-[min(78%,620px)] min-w-[88px] rounded-2xl border px-3.5 py-2.5 shadow-sm ${me
        ? 'rounded-br-md border-indigo-400/30 bg-gradient-to-br from-indigo-600/35 to-violet-600/20 text-white'
        : 'rounded-bl-md border-slate-700/80 bg-slate-900/90 text-slate-100'
      }`}>
        {showSender && !me && (
          <div className="mb-1 text-xs font-semibold tracking-wide text-cyan-300">
            {senderName}
            {sender?.profile?.iit || sender?.iit ? (
              <span className="ml-2 font-normal text-slate-400">
                {sender.profile?.iit || sender.iit}
              </span>
            ) : null}
          </div>
        )}

        <div className="whitespace-pre-wrap break-words text-[14px] leading-6">{msg.text}</div>

        <div className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${me ? 'text-indigo-100/70' : 'text-slate-400'}`}>
          <span>{formatTime(msg.createdAt)}</span>
          {me && <span aria-label={isSeen ? 'Seen' : 'Sent'}>{isSeen ? '✓✓' : '✓'}</span>}
        </div>
      </div>
    </div>
  )
}
