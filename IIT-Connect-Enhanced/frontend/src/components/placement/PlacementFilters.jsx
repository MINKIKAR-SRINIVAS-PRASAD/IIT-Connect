import React, { useState } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'

export default function PlacementFilters({ onApply }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="font-semibold">Search</div>
      <div className="mt-3 grid md:grid-cols-3 gap-3">
        <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <div className="flex items-end">
          <Button className="w-full" onClick={() => onApply({ company, role })}>Apply</Button>
        </div>
      </div>
    </div>
  )
}
