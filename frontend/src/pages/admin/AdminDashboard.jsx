import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import Loader from '../../components/common/Loader'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data.stats)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="text-sm text-slate-400">Total Users</div>
        <div className="text-3xl font-bold mt-2">{stats?.totalUsers ?? 0}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="text-sm text-slate-400">Total Posts</div>
        <div className="text-3xl font-bold mt-2">{stats?.totalPosts ?? 0}</div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="text-sm text-slate-400">Pending Approvals</div>
        <div className="text-3xl font-bold mt-2">{stats?.pendingApprovals ?? 0}</div>
      </div>
    </div>
  )
}
