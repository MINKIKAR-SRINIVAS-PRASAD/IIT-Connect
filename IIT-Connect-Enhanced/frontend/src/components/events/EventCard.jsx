import React from 'react'
import Button from '../common/Button'
import { formatDateTime } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'

export default function EventCard({ event, onOpen, onDeleted }) {
  const { user } = useAuth()
  const isOwner = String(event.authorId?._id || event.authorId) === String(user?._id || user?.id)
  const canDelete = isOwner || user?.role === 'admin'
  async function deleteEvent() {
    if (!window.confirm('Delete this event for everyone?')) return
    try { await api.delete('/events/' + event._id); toast.success('Event deleted'); onDeleted?.() }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not delete event') }
  }
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
          {canDelete && <button type="button" onClick={deleteEvent} className="ml-2 rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-300">{isOwner?'Delete event':'Admin · Delete event'}</button>
        </div>
      </div>
    </div>
  )
}
