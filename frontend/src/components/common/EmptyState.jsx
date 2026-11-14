import React from 'react'

export default function EmptyState({ title = 'Nothing here yet', subtitle = 'Create something to get started.' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
    </div>
  )
}
