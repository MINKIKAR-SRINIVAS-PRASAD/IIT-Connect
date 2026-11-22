
import React from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'

import { useAuth } from './hooks/useAuth'

import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

import DashboardLayout from './layouts/DashboardLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import FacultyPortal from './pages/faculty/FacultyPortal.jsx'

import HomeFeed from './pages/dashboard/HomeFeed.jsx'
import Chat from './pages/dashboard/Chat.jsx'
import Gallery from './pages/dashboard/Gallery.jsx'
import Travel from './pages/dashboard/travel.jsx'
import Placement from './pages/dashboard/Placement.jsx'
import Events from './pages/dashboard/Events.jsx'
import Profile from './pages/dashboard/Profile.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Users from './pages/admin/Users.jsx'
import Approvals from './pages/admin/Approvals.jsx'
import Analytics from './pages/admin/Analytics.jsx'

// Check profile completion
export function isProfileComplete(user) {
  const profile = user?.profile

  return Boolean(
    profile?.name?.trim() &&
    profile?.iit?.trim() &&
    profile?.branch?.trim() &&
    profile?.batch?.trim()
  )
}

// Authentication protection
function Protected({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-slate-300">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Profile completion protection
function ProfileCompletionGuard({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  // Faculty and administrators must never enter the student route tree.
  if (user?.role === 'faculty') return <Navigate to="/faculty" replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  if (user?.role === 'admin') {
    return children
  }

  if (
    !isProfileComplete(user) &&
    location.pathname !== '/app/profile'
  ) {
    return <Navigate to="/app/profile" replace />
  }

  return children
}

// Guest protection
function GuestOnly({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-slate-300">Loading...</div>
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />

    return (
      <Navigate
        to={
          isProfileComplete(user)
            ? '/app'
            : '/app/profile'
        }
        replace
      />
    )
  }

  return children
}

function FacultyOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-slate-300">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'faculty') return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />
  return children
}

// Admin protection
function AdminOnly({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-slate-300">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'faculty') return <Navigate to="/faculty" replace />

  if (user.role !== 'admin') {
    return (
      <Navigate
        to={
          isProfileComplete(user)
            ? '/app'
            : '/app/profile'
        }
        replace
      />
    )
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />

        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
      </Route>

      {/* Student Dashboard */}
      <Route
        path="/app"
        element={
          <Protected>
            <ProfileCompletionGuard>
              <DashboardLayout />
            </ProfileCompletionGuard>
          </Protected>
        }
      >
        <Route index element={<HomeFeed />} />

        <Route path="chat" element={<Chat />} />

        <Route path="gallery" element={<Gallery />} />

        {/* Travel Section */}
        <Route path="travel" element={<Travel />} />

        <Route path="placements" element={<Placement />} />

        <Route path="events" element={<Events />} />

        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/faculty" element={<Protected><FacultyOnly><FacultyPortal /></FacultyOnly></Protected>} />

      {/* Admin Dashboard */}
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
