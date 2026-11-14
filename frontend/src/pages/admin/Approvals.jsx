import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { api } from '../../utils/api'

function ApprovalCard({ item, type, onAction }) {
  const [reason, setReason] = useState('')

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-sm text-slate-400">{type}</div>
      <div className="mt-1 font-semibold">
        {type === 'Gallery' ? item.caption || 'Gallery post' : type === 'Placement' ? `${item.companyName} • ${item.role}` : item.title}
      </div>
      <div className="text-xs text-slate-400 mt-1">By: {item.authorId?.profile?.name || item.authorId?.email}</div>
      {type === 'Gallery' && item.imageUrl ? <img src={item.imageUrl} className="mt-3 w-full h-40 object-cover rounded-xl border border-slate-800" /> : null}

      <div className="mt-3 grid md:grid-cols-3 gap-2">
        <Button onClick={() => onAction('Approved', '')}>Approve</Button>
        <Input className="md:col-span-2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason (optional)" />
        <Button variant="danger" className="md:col-span-3" onClick={() => onAction('Rejected', reason)}>
          Reject
        </Button>
      </div>
    </div>
  )
}

export default function Approvals() {
  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState([])
  const [placements, setPlacements] = useState([])
  const [events, setEvents] = useState([])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/approvals/pending')
      setGallery(data.gallery)
      setPlacements(data.placements)
      setEvents(data.events)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  async function act(kind, id, status, rejectionReason) {
    try {
      const endpoint =
        kind === 'Gallery' ? `/admin/approvals/gallery/${id}` : kind === 'Placement' ? `/admin/approvals/placements/${id}` : `/admin/approvals/events/${id}`
      await api.put(endpoint, { status, rejectionReason })
      toast.success(`${kind} ${status}`)
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed')
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="space-y-8">
      <div>
        <div className="text-lg font-semibold">Pending Gallery</div>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          {gallery.map((g) => (
            <ApprovalCard key={g._id} item={g} type="Gallery" onAction={(s, r) => act('Gallery', g._id, s, r)} />
          ))}
          {!gallery.length ? <div className="text-sm text-slate-400">No pending gallery posts.</div> : null}
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold">Pending Placement</div>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          {placements.map((p) => (
            <ApprovalCard key={p._id} item={p} type="Placement" onAction={(s, r) => act('Placement', p._id, s, r)} />
          ))}
          {!placements.length ? <div className="text-sm text-slate-400">No pending placement posts.</div> : null}
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold">Pending Events</div>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          {events.map((e) => (
            <ApprovalCard key={e._id} item={e} type="Event" onAction={(s, r) => act('Event', e._id, s, r)} />
          ))}
          {!events.length ? <div className="text-sm text-slate-400">No pending event posts.</div> : null}
        </div>
      </div>
    </div>
  )
}
