import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    try { await login(email.trim(), password); nav('/app') }
    catch (error) { toast.error(error?.response?.data?.message || 'Login failed') }
    finally { setBusy(false) }
  }

  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.45}}>
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1df] text-[#527b42]"><LockKeyhole size={22}/></div>
    <div className="text-[10px] font-bold tracking-[.2em] text-[#719b42]">WELCOME BACK</div>
    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#203927]">Sign in to your network.</h2>
    <p className="mt-2 text-sm leading-6 text-[#718075]">Pick up where your IIT community left off.</p>
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <label className="auth-label block"><span>Institute email</span><div className="auth-input-wrap mt-2"><Mail size={17}/><input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@iit.ac.in"/></div></label>
      <label className="auth-label block"><span>Password</span><div className="auth-input-wrap mt-2"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
      <button disabled={busy} className="auth-submit flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy?'Signing in…':'Sign in'}<ArrowRight size={16}/></button>
    </form>
    <p className="mt-7 text-center text-sm text-[#718075]">New to the community? <Link to="/register" className="font-bold text-[#47733d] hover:text-[#244c32]">Create an account</Link></p>
  </motion.div>
}
