import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/nav/AdminSidebar.jsx'
import Topbar from '../components/nav/Topbar.jsx'

export default function AdminLayout() {
  return <div className="dashboard-shell min-h-screen bg-[#f4f6ef]">
    <div className="flex min-h-screen">
      <AdminSidebar/>
      <div className="min-w-0 flex-1">
        <Topbar admin/>
        <main className="relative px-4 py-6 md:px-8 md:py-8"><div className="mx-auto w-full max-w-[1440px]"><Outlet/></div></main>
      </div>
    </div>
  </div>
}
