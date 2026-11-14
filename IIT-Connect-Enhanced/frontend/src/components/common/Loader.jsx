import React from 'react'

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-300">
      <div className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-indigo-400 animate-spin" />
      <div>{label}</div>
    </div>
  )
}
