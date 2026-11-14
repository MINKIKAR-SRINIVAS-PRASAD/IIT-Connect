import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

import DashboardLayout from './layouts/DashboardLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

import HomeFeed from './pages/dashboard/HomeFeed.jsx'
import Chat from './pages/dashboard/Chat.jsx'
import Gallery from './pages/dashboard/Gallery.jsx'
import Placement from './pages/dashboard/Placement.jsx'
import Events from './pages/dashboard/Events.jsx'
import Profile from './pages/dashboard/Profile.jsx'
import Travel from './pages/dashboard/Travel.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Users from './pages/admin/Users.jsx'
import Approvals from './pages/admin/Approvals.jsx'
import Analytics from './pages/admin/Analytics.jsx'
import DeletedContent from './pages/admin/DeletedContent.jsx'

function hasCompletedStudentProfile(user) {
  const profile = user?.profile || {}
  return Boolean(
    user?.role === 'admin' ||
    (
      profile.name?.trim() &&
      profile.iit?.trim() &&
      profile.branch?.trim() &&
      profile.batch?.trim() &&
      profile.photoUrl?.trim()
    )
  )
}

function Protected({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="p-8 text-slate-300">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  const profileComplete = hasCompletedStudentProfile(user)
  const isProfilePage = location.pathname === '/app/profile'

  // Incomplete students may only access profile setup. Admins are exempt.
  if (!profileComplete && !isProfilePage) {
    return <Navigate to="/app/profile" replace />
  }

  return children
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-slate-300">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/app" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/app"
        element={
          <Protected>
            <DashboardLayout />
          </Protected>
        }
      >
        <Route index element={<HomeFeed />} />
        <Route path="chat" element={<Chat />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="placements" element={<Placement />} />
        <Route path="events" element={<Events />} />
        <Route path="travel" element={<Travel />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminOnly>
            <AdminLayout />
          </AdminOnly>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="deleted-content" element={<DeletedContent />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
