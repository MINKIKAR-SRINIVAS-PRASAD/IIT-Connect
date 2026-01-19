import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loader from '../../components/common/Loader'
import { api } from '../../utils/api'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/logs')
      setLogs(data.logs)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="font-semibold">Admin Logs</div>
      <div className="mt-3 space-y-2 max-h-[70vh] overflow-auto">
        {logs.map((l) => (
          <div key={l._id} className="rounded-xl border border-slate-800 p-3">
            <div className="text-sm font-medium">{l.action}</div>
            <div className="text-xs text-slate-400">By: {l.adminId?.email} • {new Date(l.createdAt).toLocaleString()}</div>
            <div className="text-xs text-slate-400">Target: {l.targetType} {l.targetId || ''}</div>
          </div>
        ))}
        {!logs.length ? <div className="text-sm text-slate-400">No logs yet.</div> : null}
      </div>
    </div>
  )
}
