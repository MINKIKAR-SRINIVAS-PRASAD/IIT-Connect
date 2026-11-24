import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'

import DashboardLayout from './layouts/DashboardLayout.jsx'
import PortalShell from './layouts/PortalShell.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

import HomeFeed from './pages/dashboard/HomeFeed.jsx'
import Chat from './pages/dashboard/Chat.jsx'
import Gallery from './pages/dashboard/Gallery.jsx'
import Placement from './pages/dashboard/Placement.jsx'
import Events from './pages/dashboard/Events.jsx'
import Profile from './pages/dashboard/Profile.jsx'
import Trip from './pages/dashboard/Trip.jsx'
import TravelHome from './pages/dashboard/TravelHome.jsx'
import Study from './pages/dashboard/Study.jsx'
import News from './pages/dashboard/News.jsx'
import Students from './pages/dashboard/Students.jsx'
import IITConnectAI from './pages/dashboard/IITConnectAI.jsx'
import FacultyWorkspace from './pages/FacultyWorkspaceLive.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Users from './pages/admin/Users.jsx'
import Approvals from './pages/admin/Approvals.jsx'
import Analytics from './pages/admin/Analytics.jsx'
import DeletedContent from './pages/admin/DeletedContent.jsx'
import FacultyRequests from './pages/admin/FacultyRequests.jsx'

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
  if (user.role === 'faculty') return <Navigate to={user.facultyVerified ? '/faculty/home' : '/faculty/access-pending'} replace />

  const profileComplete = hasCompletedStudentProfile(user)
  const isProfilePage = location.pathname === '/app/profile'

  if (!profileComplete && !isProfilePage) {
    return <Navigate to="/app/profile" replace />
  }

  return children
}


function FacultyOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-slate-300">Loading faculty workspace…</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'faculty' && user.role !== 'admin') return <Navigate to="/app" replace />
  if (user.role === 'faculty' && !user.facultyVerified) return <Navigate to="/faculty/access-pending" replace />
  return children
}

function FacultyAccessPending() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'faculty' || user.facultyVerified) return <Navigate to={user.role === 'faculty' ? '/faculty/home' : '/app'} replace />
  return <div className="min-h-screen bg-[#090b12] p-8 text-slate-100"><div className="mx-auto max-w-xl rounded-2xl border border-amber-200/15 bg-white/[.03] p-8"><p className="text-xs uppercase tracking-widest text-amber-200">Faculty Network</p><h1 className="mt-3 text-2xl font-semibold">Faculty verification pending</h1><p className="mt-3 text-sm leading-6 text-slate-400">Your faculty account request is awaiting institute verification. Faculty-only pages and data remain locked until approval.</p><button className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-sm" onClick={() => window.location.href='/login'}>Return to sign in</button></div></div>
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
        <Route path="students" element={<Students />} />
        <Route path="ai" element={<IITConnectAI />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="placements" element={<Placement />} />
        <Route path="events" element={<Events />} />
        <Route path="news" element={<News />} />
        <Route path="trip" element={<Trip />} />
        <Route path="travel-home" element={<TravelHome />} />
        <Route path="travel" element={<Navigate to="/app/travel-home" replace />} />
        <Route path="study" element={<Study />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      
      <Route path="/faculty/access-pending" element={<FacultyAccessPending />} />
      <Route path="/faculty" element={<FacultyOnly><FacultyWorkspace section="home" /></FacultyOnly>} />
      <Route path="/faculty/home" element={<FacultyOnly><FacultyWorkspace section="home" /></FacultyOnly>} />
      <Route path="/faculty/events" element={<FacultyOnly><FacultyWorkspace section="events" /></FacultyOnly>} />
      <Route path="/faculty/news" element={<FacultyOnly><PortalShell><News /></PortalShell></FacultyOnly>} />
      <Route path="/faculty/gallery" element={<FacultyOnly><FacultyWorkspace section="gallery" /></FacultyOnly>} />
      <Route path="/faculty/study" element={<FacultyOnly><FacultyWorkspace section="study" /></FacultyOnly>} />
      <Route path="/faculty/publications" element={<FacultyOnly><FacultyWorkspace section="publications" /></FacultyOnly>} />
      <Route path="/faculty/travel" element={<FacultyOnly><FacultyWorkspace section="travel" /></FacultyOnly>} />
      <Route path="/faculty/community" element={<FacultyOnly><FacultyWorkspace section="community" /></FacultyOnly>} />
      <Route path="/faculty/ai" element={<FacultyOnly><PortalShell><IITConnectAI /></PortalShell></FacultyOnly>} />

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
        <Route path="faculty-requests" element={<FacultyRequests />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="deleted-content" element={<DeletedContent />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
