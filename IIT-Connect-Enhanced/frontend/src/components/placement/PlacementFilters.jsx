import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Input from '../common/Input'
import Button from '../common/Button'

export default function PlacementFilters({ onApply }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')

  function applySearch() {
    if (!company.trim() || !role.trim()) {
      toast.error('Company and Role are both required to search')
      return
    }
    onApply({ company: company.trim(), role: role.trim() })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        applySearch()
      }}
      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
    >
      <div className="font-semibold">Search</div>
      <p className="mt-1 text-xs text-slate-400">Enter both fields to search placement experiences.</p>
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        <Input label="Company *" value={company} onChange={(e) => setCompany(e.target.value)} required />
        <Input label="Role *" value={role} onChange={(e) => setRole(e.target.value)} required />
        <div className="flex items-end">
          <Button type="submit" className="w-full">Apply</Button>
        </div>
      </div>
    </form>
  )
}
