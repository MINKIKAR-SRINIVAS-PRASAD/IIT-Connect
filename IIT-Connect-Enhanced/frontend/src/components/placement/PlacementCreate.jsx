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

    const required = [
      ['Company', companyName],
      ['Role', role],
      ['CTC', ctc],
      ['Interview Questions', questions],
      ['Rounds Details', rounds],
      ['Tips', tips]
    ]
    const missing = required.find(([, value]) => !String(value).trim())
    if (missing) {
      toast.error(`${missing[0]} is required`)
      return
    }

    const interviewQuestions = questions.split('\n').map((s) => s.trim()).filter(Boolean)
    const roundDetails = rounds.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!interviewQuestions.length || !roundDetails.length) {
      toast.error('Add at least one interview question and round detail')
      return
    }

    setBusy(true)
    try {
      const payload = {
        companyName: companyName.trim(),
        role: role.trim(),
        ctc: ctc.trim(),
        interviewQuestions,
        rounds: roundDetails,
        tips: tips.trim()
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
      <p className="mt-1 text-xs text-slate-400">All fields are required before submission.</p>
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        <Input label="Company *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        <Input label="Role *" value={role} onChange={(e) => setRole(e.target.value)} required />
        <Input label="CTC *" value={ctc} onChange={(e) => setCtc(e.target.value)} required />
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <label className="block">
          <div className="text-sm text-slate-300 mb-1">Interview Questions *</div>
          <textarea
            className="w-full min-h-[120px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <div className="text-sm text-slate-300 mb-1">Rounds Details *</div>
          <textarea
            className="w-full min-h-[120px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="block mt-3">
        <div className="text-sm text-slate-300 mb-1">Tips *</div>
        <textarea
          className="w-full min-h-[90px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          required
        />
      </label>
      <div className="mt-3">
        <Button disabled={busy}>{busy ? 'Submitting...' : 'Submit (Pending)'}</Button>
      </div>
    </form>
  )
}
