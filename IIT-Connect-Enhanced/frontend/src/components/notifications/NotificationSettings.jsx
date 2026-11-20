import React, { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

function decodeKey(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false)
  const [available, setAvailable] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([api.get('/notifications/status'), api.get('/notifications/public-key')])
      .then(([status, key]) => {
        if (!active) return
        setEnabled(Boolean(status.data?.enabled))
        setAvailable(Boolean(key.data?.publicKey) && 'serviceWorker' in navigator && 'PushManager' in window)
      })
      .catch(() => { if (active) setAvailable(false) })
    return () => { active = false }
  }, [])

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      if (enabled) {
        const registration = await navigator.serviceWorker.getRegistration('/')
        const subscription = await registration?.pushManager.getSubscription()
        if (subscription) {
          await api.delete('/notifications/subscribe', { data: { endpoint: subscription.endpoint } })
          await subscription.unsubscribe()
        }
        setEnabled(false)
        toast.success('Device notifications turned off')
        return
      }
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Device notifications are not supported in this browser')
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') throw new Error('Allow notifications in your browser to enable alerts')
      const { data: keyData } = await api.get('/notifications/public-key')
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(keyData.publicKey)
      })
      await api.post('/notifications/subscribe', { subscription: subscription.toJSON() })
      setEnabled(true)
      toast.success('Message notifications enabled')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Could not update notifications')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
          {enabled ? <Bell size={20}/> : <BellOff size={20}/>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">Device notifications</h3>
          <p className="mt-1 text-sm text-slate-400">
            {enabled ? 'Only important message alerts. No constant notifications.' : 'Get an alert when a new message arrives.'}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || (!available && !enabled)}
          onClick={toggle}
          className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Please wait…' : enabled ? 'Turn off' : 'Enable'}
        </button>
      </div>
      {!available && !enabled && <p className="mt-3 text-xs text-amber-300">Push service is not configured or this browser does not support it yet.</p>}
    </section>
  )
}
