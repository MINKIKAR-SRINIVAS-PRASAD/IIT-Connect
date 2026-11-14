import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Input from '../common/Input'
import { api } from '../../utils/api'

export default function PlacementCreate({ onCreated }) {
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [ctc, setCtc] = useState('')
  const [questions, setQuestions] = useState('')
  const [rounds, setRounds] = useState('')
  const [tips, setTips] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        companyName,
        role,
        ctc,
        interviewQuestions: questions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        rounds: rounds
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        tips
      }
      await api.post('/placements', payload)
      toast.success('Submitted (Pending approval)')
      setCompanyName('')
      setRole('')
      setCtc('')
      setQuestions('')
      setRounds('')
      setTips('')
      onCreated?.()
    } catch (e2) {
      toast.error(e2?.response?.data?.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="font-semibold">Share Interview Experience</div>
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        <Input label="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} required />
        <Input label="CTC (optional)" value={ctc} onChange={(e) => setCtc(e.target.value)} />
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <label className="block">
          <div className="text-sm text-slate-300 mb-1">Interview Questions</div>
          <textarea
            className="w-full min-h-[120px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
        </label>
        <label className="block">
          <div className="text-sm text-slate-300 mb-1">Rounds Details</div>
          <textarea
            className="w-full min-h-[120px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
          />
        </label>
      </div>
      <label className="block mt-3">
        <div className="text-sm text-slate-300 mb-1">Tips</div>
        <textarea
          className="w-full min-h-[90px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
        />
      </label>
      <div className="mt-3">
        <Button disabled={busy}>{busy ? 'Submitting...' : 'Submit (Pending)'}</Button>
      </div>
    </form>
  )
}
