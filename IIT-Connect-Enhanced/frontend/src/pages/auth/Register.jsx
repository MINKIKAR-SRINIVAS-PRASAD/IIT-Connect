import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserPlus, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function Register() {
  const { sendRegistrationOtp, verifyRegistrationOtp } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [accountType, setAccountType] = useState('student')
  const [facultyProfile, setFacultyProfile] = useState({ name: '', institute: '', department: '', designation: '', researchInterests: '' })
  const setFacultyField = (key, value) => setFacultyProfile(current => ({ ...current, [key]: value }))
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('details')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  async function requestOtp(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await sendRegistrationOtp(email.trim(), password, accountType, facultyProfile)
      setStep('otp')
      toast.success('Verification code sent to your institute email')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not send verification code')
    } finally { setBusy(false) }
  }

  async function confirmOtp(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const data = await verifyRegistrationOtp(email.trim(), otp)
      nav(data.user.role === 'faculty' ? '/faculty/access-pending' : '/app/profile')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Verification failed')
    } finally { setBusy(false) }
  }

  async function resendOtp() {
    setBusy(true)
    try {
      await sendRegistrationOtp(email.trim(), password, accountType, facultyProfile)
      setOtp('')
      toast.success('A new verification code has been sent')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not resend code')
    } finally { setBusy(false) }
  }

  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.45}}>
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1df] text-[#527b42]">{step === 'otp' ? <ShieldCheck size={22}/> : <UserPlus size={22}/>}</div>
    <div className="text-[10px] font-bold tracking-[.2em] text-[#719b42]">{step === 'otp' ? 'EMAIL VERIFICATION' : accountType === 'faculty' ? 'REQUEST FACULTY ACCESS' : 'JOIN THE NETWORK'}</div>
    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#203927]">{step === 'otp' ? 'Check your inbox.' : accountType === 'faculty' ? 'Join the faculty network.' : 'Your community awaits.'}</h2>
    <p className="mt-2 text-sm leading-6 text-[#718075]">{step === 'otp' ? `Enter the 6-digit code sent to ${email}.` : accountType === 'faculty' ? 'Submit your faculty details for verification. Faculty access stays locked until approved.' : 'Create your account with your institute email address.'}</p>

    {step === 'details' ? <form onSubmit={requestOtp} className="mt-8 space-y-5">
      <label className="auth-label block"><span>Institute email</span><div className="auth-input-wrap mt-2"><Mail size={17}/><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@iit.ac.in"/></div></label>
      <label className="auth-label block"><span>Account type</span><select value={accountType} onChange={e=>setAccountType(e.target.value)} className="auth-input-wrap mt-2 w-full"><option value="student">Student community</option><option value="faculty">Faculty network — verification required</option></select></label>
      {accountType === 'faculty' && <div className="space-y-3 rounded-xl border border-[#47733d]/15 bg-[#47733d]/[.04] p-4">
        <p className="text-xs font-semibold text-[#47733d]">Faculty details (required)</p>
        <input required value={facultyProfile.name} onChange={e=>setFacultyField('name',e.target.value)} placeholder="Full name" className="auth-input-wrap w-full"/>
        <input required value={facultyProfile.institute} onChange={e=>setFacultyField('institute',e.target.value)} placeholder="Institute" className="auth-input-wrap w-full"/>
        <input required value={facultyProfile.department} onChange={e=>setFacultyField('department',e.target.value)} placeholder="Department" className="auth-input-wrap w-full"/>
        <input required value={facultyProfile.designation} onChange={e=>setFacultyField('designation',e.target.value)} placeholder="Designation" className="auth-input-wrap w-full"/>
        <input value={facultyProfile.researchInterests} onChange={e=>setFacultyField('researchInterests',e.target.value)} placeholder="Research interests (optional)" className="auth-input-wrap w-full"/>
      </div>}
      <label className="auth-label block"><span>Create password</span><div className="auth-input-wrap mt-2"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
      <button disabled={busy} className="auth-submit flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy?'Sending code…':'Send verification code'}<ArrowRight size={16}/></button>
    </form> : <form onSubmit={confirmOtp} className="mt-8 space-y-5">
      <label className="auth-label block"><span>6-digit verification code</span><div className="auth-input-wrap mt-2"><ShieldCheck size={17}/><input type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} pattern="[0-9]{6}" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter OTP"/></div></label>
      <button disabled={busy || otp.length !== 6} className="auth-submit flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{busy?'Verifying…':'Verify email and create account'}<ArrowRight size={16}/></button>
      <div className="flex items-center justify-between text-sm"><button type="button" disabled={busy} onClick={resendOtp} className="font-bold text-[#47733d] disabled:opacity-50">Resend code</button><button type="button" disabled={busy} onClick={()=>{setStep('details');setOtp('')}} className="text-[#718075]">Change email</button></div>
      <p className="text-xs text-[#718075]">The code expires in 5 minutes. You can request another code after 60 seconds.</p>
    </form>}

    <p className="mt-7 text-center text-sm text-[#718075]">Already a member? <Link to="/login" className="font-bold text-[#47733d] hover:text-[#244c32]">Sign in</Link></p>
  </motion.div>
}
