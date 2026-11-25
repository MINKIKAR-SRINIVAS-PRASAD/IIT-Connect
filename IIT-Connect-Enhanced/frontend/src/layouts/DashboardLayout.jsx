import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, MessageCircle, Search, UserRound } from 'lucide-react'
import PortalShell from './PortalShell.jsx'
import { useAuth } from '../hooks/useAuth'

const studentTabs=[
 {to:'/app',label:'Home',Icon:Home,end:true},
 {to:'/app/study',label:'Study',Icon:BookOpen},
 {to:'/app/chat',label:'Chat',Icon:MessageCircle},
 {to:'/app/students',label:'Search',Icon:Search},
 {to:'/app/profile',label:'Profile',Icon:UserRound}
]
function StudentMobileBar(){
 const {user}=useAuth(),location=useLocation()
 if(user?.role!=='student')return null
 return <nav aria-label="Student mobile navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[9999] grid grid-cols-5 border-t border-white/10 bg-white/95 px-1 pt-2 shadow-[0_-8px_28px_rgba(0,0,0,.12)] backdrop-blur-xl md:hidden" style={{position:'fixed',left:0,right:0,bottom:0,zIndex:9999,display:'grid',paddingBottom:'max(8px, env(safe-area-inset-bottom))'}}>
 {studentTabs.map(({to,label,Icon,end})=><NavLink key={to} to={to} end={end} aria-current={(end?location.pathname===to:location.pathname.startsWith(to))?'page':undefined} className={({isActive})=>'flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium '+(isActive?'text-[#c7dfb7]':'text-slate-400')}><Icon size={20} strokeWidth={1.8}/><span>{label}</span></NavLink>)}
 </nav>
}
export default function DashboardLayout(){
 return <><PortalShell><Outlet/></PortalShell><StudentMobileBar/></>
}
