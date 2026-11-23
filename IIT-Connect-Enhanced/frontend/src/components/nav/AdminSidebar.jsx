import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, ClipboardCheck, ChartNoAxesCombined, Trash2, ArrowLeft, ShieldCheck, GraduationCap } from 'lucide-react'
import BrandSymbol from '../common/BrandSymbol'

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/faculty-requests', label: 'Faculty Verification', icon: GraduationCap },
  { to: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/admin/deleted-content', label: 'Deleted Content', icon: Trash2 }
]

export default function AdminSidebar() {
  return <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-[258px] shrink-0 border-r border-[#203927]/10 bg-[#fbfcf7] px-4 py-5 md:flex md:flex-col">
    <div className="flex items-center gap-3 px-2 py-2"><BrandSymbol className="h-8 w-[64px] object-contain"/><div><div className="text-sm font-bold text-[#203927]">Admin workspace</div><div className="mt-0.5 text-[9px] font-semibold tracking-[.16em] text-[#879488]">IITStudentsOS CONTROL</div></div></div>
    <div className="mb-3 mt-9 px-3 text-[9px] font-bold tracking-[.2em] text-[#9aa59b]">MANAGEMENT</div>
    <nav className="flex-1 space-y-1">
      {links.map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/admin'} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all ${isActive?'sidebar-link-active text-[#315d3e]':'text-[#718075] hover:bg-[#edf2e7] hover:text-[#315d3e]'}`}><Icon size={17}/>{label}</NavLink>)}
    </nav>
    <NavLink to="/app" className="mt-5 flex items-center gap-2 rounded-xl border border-[#315d3e]/10 px-3 py-3 text-xs font-semibold text-[#627568] transition hover:bg-[#edf2e7] hover:text-[#315d3e]"><ArrowLeft size={15}/>Back to student app</NavLink>
  </aside>
}
