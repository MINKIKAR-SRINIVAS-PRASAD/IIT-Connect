import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import { api } from '../../utils/api'
import { SocketContext } from '../../context/SocketContext.jsx'

function Field({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return <div className="min-w-0"><div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 break-words text-sm text-slate-200">{display}</div></div>
}

export default function DeletedContent() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { socket } = useContext(SocketContext) || {}

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/notifications/deletions')
      setItems(data.notifications || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not load deletion notifications')
    } finally {
      setLoading(false)
    }
  }

  async function markRead(id) {
    try {
      await api.put(`/admin/notifications/deletions/${id}/read`)
      setItems((current) => current.map((item) => item._id === id ? { ...item, readAt: new Date().toISOString() } : item))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not update notification')
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!socket) return undefined
    const onDeleted = (notification) => {
      await load()
      toast('A student deleted a Gallery/Travel submission', { icon: '🗑️' })
    }
    socket.on('admin:content-deleted', onDeleted)
    return () => socket.off('admin:content-deleted', onDeleted)
  }, [socket])

  if (loading) return <Loader />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-white">Deleted content notifications</h1><p className="mt-1 text-sm text-slate-400">Audit trail of Gallery and Travel posts removed by their owners. Deleted posts remain hidden from students.</p></div>
        <button onClick={load} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900">Refresh</button>
      </div>
      {!items.length ? <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">No student deletion notifications yet.</div> : (
        <div className="space-y-4">
          {items.map((item) => {
            const snapshot = item.contentSnapshot || {}
            return (
              <article key={item._id} className={`rounded-2xl border bg-slate-950 p-5 ${item.readAt ? 'border-slate-800' : 'border-amber-500/40'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className="text-xs font-semibold uppercase tracking-wide text-amber-300">{item.contentType} deleted for everyone</div><h2 className="mt-1 text-lg font-semibold text-white">{item.contentTitle}</h2><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>
                  {!item.readAt && <button onClick={() => markRead(item._id)} className="rounded-lg border border-indigo-500/40 px-3 py-2 text-xs text-indigo-200 hover:bg-indigo-500/10">Mark as read</button>}
                </div>
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Student details</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Student name" value={item.actorName} />
                    <Field label="Institute email" value={item.actorEmail} />
                    <Field label="Institute" value={item.institute} />
                    <Field label="Submission ID" value={item.contentId} />
                    <Field label="Original submission status" value={snapshot.status} />
                    <Field label="Submitted at" value={snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString() : ''} />
                    <Field label="Deleted at" value={item.createdAt ? new Date(item.createdAt).toLocaleString() : ''} />
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-slate-800 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Retained submission details</h3>
                  {item.contentType === 'Gallery' && snapshot.imageUrl && <img src={snapshot.imageUrl} alt="Deleted gallery submission snapshot" className="mb-4 max-h-64 rounded-lg object-contain" />}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(snapshot).filter(([key, value]) => !['_id', '__v', 'authorId', 'imageUrl', 'imagePublicId', 'deletedBy'].includes(key) && value !== '' && value !== null && value !== undefined && typeof value !== 'object').map(([key, value]) => <Field key={key} label={key} value={value} />)}
                  </div>
                  {item.mediaCleanupPending && <p className="mt-3 text-xs text-amber-300">Cloudinary image cleanup needs attention.</p>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
