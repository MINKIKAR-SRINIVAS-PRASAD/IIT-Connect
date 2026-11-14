import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/nav/Sidebar.jsx'
import Topbar from '../components/nav/Topbar.jsx'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
