import React from 'react'
import { Outlet } from 'react-router-dom'
import PortalShell from './PortalShell.jsx'

export default function DashboardLayout() {
  return <PortalShell><Outlet/></PortalShell>
}
