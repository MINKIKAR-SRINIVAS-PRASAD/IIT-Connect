import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MessageCircle, Sparkles } from 'lucide-react'
import ChatSidebar from '../../components/chat/ChatSidebar.jsx'
import ChatWindow from '../../components/chat/ChatWindow.jsx'
import { api } from '../../utils/api'
import { useSocket } from '../../hooks/useSocket'

export default function Chat() {
  const [active, setActive] = useState(null)
  const { socket } = useSocket()
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
  return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.35}} className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="section-kicker">YOUR PEOPLE, ONE MESSAGE AWAY</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#203927]">Conversations</h1><p className="mt-1 text-sm text-[#718075]">Connect with students across the IIT network.</p></div><div className="flex items-center gap-2 rounded-full border border-[#719b42]/20 bg-[#eaf1df] px-3 py-2 text-xs font-semibold text-[#527b42]"><Sparkles size={14}/>Community chat</div></div>
    <div className="chat-workspace flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-[#315d3e]/12 bg-[#171e19] shadow-[0_20px_65px_rgba(0,0,0,.24)] md:flex-row">
      <ChatSidebar activeId={active?._id} onSelectConversation={setActive} onStartDM={startDM} onJoinGroup={joinGroup} onJoinCommunity={joinCommunity} onLeaveConversation={(id)=>setActive(current=>current?._id===id?null:current)}/>
      <ChatWindow conversation={active}/>
    </div>
  </motion.div>
}
