import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">IITStudentsOS</Link>
          <Link to="/" className="text-sm text-slate-300 hover:text-white">Back</Link>
        </div>
        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <h1 className="text-3xl font-bold">Private IIT Network</h1>
            <p className="mt-2 text-slate-300">Only IIT emails allowed. Secure login with HttpOnly cookies.</p>
            <ul className="mt-6 space-y-2 text-slate-300 text-sm">
              <li>• Real-time chat (DM + IIT group)</li>
              <li>• Gallery + admin approval</li>
              <li>• Placement experiences</li>
              <li>• Events </li>
              <li>• handle by IITans Network</li>
              <li>• only for IIT Users</li>              
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
