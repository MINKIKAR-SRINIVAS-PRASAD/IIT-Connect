import React from 'react'

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition border disabled:opacity-50 disabled:cursor-not-allowed'

  const styles =
    variant === 'ghost'
      ? 'bg-transparent border-slate-800 hover:bg-slate-900 text-slate-100'
      : variant === 'danger'
      ? 'bg-rose-600 border-rose-500 hover:bg-rose-500 text-white'
      : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white'

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}
