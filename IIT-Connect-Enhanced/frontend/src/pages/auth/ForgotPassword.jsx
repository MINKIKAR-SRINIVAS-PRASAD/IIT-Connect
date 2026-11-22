import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function sendCode(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
      toast.success(data.message || 'If the account exists, a reset code was sent')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not request reset code')
    } finally { setBusy(false) }
  }

  async function reset(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp, password })
      toast.success('Password reset. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Password reset failed')
    } finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-md">
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1df] text-[#527b42]"><KeyRound size={22}/></div>
    <div className="text-[10px] font-bold tracking-[.2em] text-[#719b42]">ACCOUNT RECOVERY</div>
    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#203927]">Reset your password.</h2>
    <p className="mt-2 text-sm leading-6 text-[#718075]">We’ll send a one-time code to your institute email.</p>
    {!sent ? <form onSubmit={sendCode} className="mt-8 space-y-5">
      <label className="auth-label block"><span>Institute email</span><div className="auth-input-wrap mt-2"><Mail size={17}/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@iit.ac.in"/></div></label>
      <button disabled={busy} className="auth-submit flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy?'Sending…':'Send reset code'}<ShieldCheck size={16}/></button>
    </form> : <form onSubmit={reset} className="mt-8 space-y-5">
      <label className="auth-label block"><span>6-digit reset code</span><div className="auth-input-wrap mt-2"><ShieldCheck size={17}/><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\\D/g,'').slice(0,6))} placeholder="Enter code"/></div></label>
      <label className="auth-label block"><span>New password</span><div className="auth-input-wrap mt-2"><KeyRound size={17}/><input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></div></label>
      <button disabled={busy || otp.length!==6} className="auth-submit flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy?'Updating…':'Reset password'}<ShieldCheck size={16}/></button>
      <button type="button" onClick={()=>{setSent(false);setOtp('');setPassword('')}} className="w-full text-sm text-[#47733d]">Send a new code</button>
    </form>}
    <p className="mt-7 text-center text-sm"><Link to="/login" className="inline-flex items-center gap-2 font-bold text-[#47733d]"><ArrowLeft size={15}/>Back to sign in</Link></p>
  </div>
}
