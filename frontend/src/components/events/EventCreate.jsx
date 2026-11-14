import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Input from '../common/Input'
import { api } from '../../utils/api'
import { IIT_LIST } from '../../utils/constants'

export default function EventCreate({ onCreated }) {
  const [iit, setIit] = useState(IIT_LIST[0])
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [venue, setVenue] = useState('')
  const [registrationLink, setRegistrationLink] = useState('')
  const [description, setDescription] = useState('')
  const [poster, setPoster] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('iit', iit)
      fd.append('title', title)
      fd.append('datetime', datetime)
      fd.append('venue', venue)
      fd.append('registrationLink', registrationLink)
      fd.append('description', description)
      if (poster) fd.append('poster', poster)

      await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Event submitted (Pending approval)')
      setTitle('')
      setDatetime('')
      setVenue('')
      setRegistrationLink('')
      setDescription('')
      setPoster(null)
      onCreated?.()
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="font-semibold">Submit an Event</div>
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        <label className="block">
          <div className="text-sm text-slate-300 mb-1">IIT</div>
          <select
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={iit}
            onChange={(e) => setIit(e.target.value)}
          >
            {IIT_LIST.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Date & Time" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <Input label="Venue (optional)" value={venue} onChange={(e) => setVenue(e.target.value)} />
        <Input label="Registration link" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} />
      </div>
      <label className="block mt-3">
        <div className="text-sm text-slate-300 mb-1">Description</div>
        <textarea className="w-full min-h-[90px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="block mt-3">
        <div className="text-sm text-slate-300 mb-1">Poster image (optional)</div>
        <input type="file" accept="image/*" className="block w-full text-sm text-slate-300" onChange={(e) => setPoster(e.target.files?.[0] || null)} />
      </label>
      <div className="mt-3">
        <Button disabled={busy}>{busy ? 'Submitting...' : 'Submit (Pending)'}</Button>
      </div>
    </form>
  )
}
