import React, { useState } from 'react'
import toast from 'react-hot-toast'
import ChatSidebar from '../../components/chat/ChatSidebar.jsx'
import ChatWindow from '../../components/chat/ChatWindow.jsx'
import { api } from '../../utils/api'

export default function Chat() {
  const [active, setActive] = useState(null)

  async function startDM(otherUserId) {
    try {
      const { data } = await api.post('/chat/dm', { otherUserId })
      setActive(data.conversation)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to start DM')
    }
  }

  async function joinGroup(iit) {
    try {
      const { data } = await api.post('/chat/group', { iit })
      setActive(data.conversation)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to join group')
    }
  }

  async function joinCommunity() {
    try {
      const { data } = await api.post('/chat/community')
      setActive(data.conversation)
      toast.success('You joined Indian IIT Students Community')
      return data.conversation
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to join the community')
      return null
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 flex flex-col md:flex-row min-h-[70vh]">
      <ChatSidebar
        activeId={active?._id}
        onSelectConversation={setActive}
        onStartDM={startDM}
        onJoinGroup={joinGroup}
        onJoinCommunity={joinCommunity}
      />
      <ChatWindow conversation={active} />
    </div>
  )
}
