import React from 'react'

export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <div className="text-sm text-slate-300 mb-1">{label}</div> : null}
      <input
        className={`w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      />
    </label>
  )
}
