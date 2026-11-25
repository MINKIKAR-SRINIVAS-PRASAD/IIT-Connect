import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Instagram, Sparkles } from 'lucide-react'
import ChatSidebar from '../../components/chat/ChatSidebar.jsx'
import ChatWindow from '../../components/chat/ChatWindow.jsx'
import { api } from '../../utils/api'
import { useSocket } from '../../hooks/useSocket'

export default function Chat() {
  const location = useLocation()
  const [active, setActive] = useState(location.state?.conversation || null)
  const { socket } = useSocket()
  useEffect(() => { if (location.state?.conversation) setActive(location.state.conversation) }, [location.state?.conversation?._id])
  useEffect(() => {
    if (!socket || !active?._id) return undefined
    socket.emit('conversation:active', { conversationId: active._id })
    return () => socket.emit('conversation:inactive')
  }, [socket, active?._id])
  async function startDM(otherUserId) {
    try { const { data } = await api.post('/chat/dm', { otherUserId }); setActive(data.conversation) }
    catch (error) { toast.error(error?.response?.data?.message || 'Failed to start DM') }
  }
  async function joinGroup(iit) {
    try { const { data } = await api.post('/chat/group', { iit }); setActive(data.conversation) }
    catch (error) { toast.error(error?.response?.data?.message || 'Failed to join group') }
  }
  async function joinCommunity() {
    try { const { data } = await api.post('/chat/community'); setActive(data.conversation); toast.success('You joined Indian IIT Students Community'); return data.conversation }
    catch (error) { toast.error(error?.response?.data?.message || 'Failed to join the community'); return null }
  }
  return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.35}} className="instagram-chat-page space-y-5">
    <div className="instagram-chat-page-heading flex flex-wrap items-end justify-between gap-3"><div><div className="section-kicker">YOUR CAMPUS, IN YOUR DMS</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#e8ece2]">Messages</h1><p className="mt-1 text-sm text-[#aab5a3]">Your recent conversations, all in one place.</p></div><div className="instagram-chat-brand"><Instagram size={17}/><span>Inbox</span><Sparkles size={14}/></div></div>
    <div className={"chat-workspace instagram-chat-shell flex min-h-[72vh] flex-col overflow-hidden rounded-[26px] border md:flex-row " + (active ? "has-active-chat" : "")}>
      <ChatSidebar activeId={active?._id} onSelectConversation={setActive} onStartDM={startDM} onJoinGroup={joinGroup} onJoinCommunity={joinCommunity} onLeaveConversation={(id)=>setActive(current=>current?._id===id?null:current)}/>
      <ChatWindow conversation={active} onBack={() => setActive(null)}/>
    </div>
  </motion.div>
}
