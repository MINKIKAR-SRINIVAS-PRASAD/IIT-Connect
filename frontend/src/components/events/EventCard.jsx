import React from 'react'
import Button from '../common/Button'
import { formatDateTime } from '../../utils/formatters'

export default function EventCard({ event, onOpen }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
      {event.posterUrl ? <img src={event.posterUrl} alt="poster" className="w-full h-40 object-cover" /> : null}
      <div className="p-4">
        <div className="text-lg font-semibold">{event.title}</div>
        <div className="mt-1 text-sm text-slate-300">{event.iit}</div>
        <div className="mt-1 text-xs text-slate-400">{formatDateTime(event.datetime)}</div>
        {event.venue ? <div className="mt-1 text-xs text-slate-400">Venue: {event.venue}</div> : null}
        <div className="mt-3">
          <Button variant="ghost" onClick={() => onOpen(event)}>Details</Button>
        </div>
      </div>
    </div>
  )
}
