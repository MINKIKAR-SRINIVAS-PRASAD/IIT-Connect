import React from 'react'
import { IIT_LIST } from '../../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-start gap-10">
          <div className="flex-1">
            <div className="text-lg font-semibold">IITStudentsOS</div>
            <div className="mt-2 text-sm text-slate-400">
              Private portal for IIT students. Secure auth via HttpOnly cookies.
            </div>
            <div className="mt-5 flex gap-3 text-sm">
              <a className="text-slate-300 hover:text-white" href="#">Twitter</a>
              <a className="text-slate-300 hover:text-white" href="#">LinkedIn</a>
              <a className="text-slate-300 hover:text-white" href="#">GitHub</a>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-200">IITs</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
              {IIT_LIST.map((x) => (
                <div key={x}>{x}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 text-xs text-slate-500">© {new Date().getFullYear()} IITStudentsOS</div>
      </div>
    </footer>
  )
}
