import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await register(email, password)
      nav('/app/profile')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Register failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Register</h2>
      <p className="mt-1 text-sm text-slate-300">Only IIT emails allowed.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@iitbbs.ac.in" />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
        />
        <Button disabled={busy} className="w-full">{busy ? 'Creating...' : 'Create account'}</Button>
      </form>

      <div className="mt-4 text-sm text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-indigo-200">
          Login
        </Link>
      </div>
    </div>
  )
}
