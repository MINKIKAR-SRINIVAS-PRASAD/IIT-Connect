import React from 'react'

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        className="px-3 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </button>
      <div className="text-sm text-slate-400">Page {page} / {totalPages}</div>
      <button
        className="px-3 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-sm"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
