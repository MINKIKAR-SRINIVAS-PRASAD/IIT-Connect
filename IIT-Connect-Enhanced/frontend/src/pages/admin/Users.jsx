import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { api } from '../../utils/api'

export default function Users() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function setBan(userId, isBanned) {
    try {
      await api.put(`/admin/users/${userId}/ban`, { isBanned })
      toast.success(isBanned ? 'User banned' : 'User unbanned')
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
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium truncate">{u.profile?.name || u.email}</div>
            <div className="text-xs text-slate-400 truncate">{u.email} • {u.role} • {u.profile?.iit || '—'}</div>
          </div>
          <Button variant={u.isBanned ? 'primary' : 'danger'} onClick={() => setBan(u._id, !u.isBanned)}>
            {u.isBanned ? 'Unban' : 'Ban'}
          </Button>
        </div>
      ))}
    </div>
  )
}
