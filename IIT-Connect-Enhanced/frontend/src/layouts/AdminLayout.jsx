import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/nav/AdminSidebar.jsx'
import Topbar from '../components/nav/Topbar.jsx'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <Topbar admin />
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
