import React from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { formatDateTime } from '../../utils/formatters'

export default function EventDetailsModal({ open, event, onClose }) {
  if (!event) return null
  return (
    <Modal open={open} title="Event Details" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-xl font-semibold">{event.title}</div>
        <div className="text-sm text-slate-300">{event.iit}</div>
        <div className="text-sm text-slate-300">{formatDateTime(event.datetime)}</div>
        {event.venue ? <div className="text-sm text-slate-300">Venue: {event.venue}</div> : null}
        {event.description ? <div className="text-sm text-slate-200">{event.description}</div> : null}
        {event.registrationLink ? (
          <a href={event.registrationLink} target="_blank" rel="noreferrer">
            <Button>Open registration</Button>
          </a>
        ) : null}
      </div>
    </Modal>
  )
}
