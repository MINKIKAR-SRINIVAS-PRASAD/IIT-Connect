
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

export default function ChatSidebar({
  activeId,
  onSelectConversation,
  onStartDM,
  onJoinGroup
}) {
  const { user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState({ incoming: [], outgoing: [], connections: [] })
  const [requestTab, setRequestTab] = useState('people')
  const loadRequests = useCallback(async () => { const { data } = await api.get('/chat/requests'); setRequests({ incoming: data.incoming || [], outgoing: data.outgoing || [], connections: data.connections || [] }) }, [])
  const connect = async (id) => { try { const { data } = await api.post(`/chat/connect/${id}`); toast.success(data.status === 'accepted' ? 'Connection accepted — chat unlocked!' : 'Request sent'); await loadRequests() } catch (e) { toast.error(e?.response?.data?.message || 'Could not send request') } }
  const respond = async (id, action) => { try { await api.patch(`/chat/requests/${id}`, { action }); toast.success(action === 'accept' ? 'Request accepted' : 'Request declined'); await loadRequests(); await fetchConversations() } catch (e) { toast.error(e?.response?.data?.message || 'Could not update request') } }
  const relation = (id) => requests.connections.some(row => String(row.user?._id) === String(id)) ? 'connected' : requests.outgoing.some(row => String(row.recipient?._id) === String(id)) ? 'pending' : requests.incoming.some(row => String(row.requester?._id) === String(id)) ? 'incoming' : 'none'
  const getUserName = (person) => {
    return (
      person?.profile?.name?.trim() ||
      person?.name ||
      person?.email?.split('@')[0] ||
      'Student'
    )
  }

  const getConversationName = (conversation) => {
    if (conversation.displayName) {
      return conversation.displayName
    }

    if (conversation.type === 'group') {
      return conversation.title ||
        `${conversation.iit || 'IIT'} Group`
    }

    if (conversation.type === 'community') {
      return conversation.title || 'IIT Community'
    }

    const participants = conversation.participants || []

    const otherUser = participants.find(
      person =>
        String(person?._id || person) !==
        String(user?._id || user?.id)
    )

    return getUserName(otherUser)
  }

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/chat/conversations')

      setConversations(data.conversations || [])
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        'Unable to load conversations'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async (query = '') => {
    try {
      const { data } = await api.get('/chat/users', {
        params: { q: query }
      })

      setUsers(data.users || [])
    } catch (error) {
      console.error('Users loading error:', error)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    fetchUsers()
    loadRequests()
  }, [fetchConversations, fetchUsers, loadRequests])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, fetchUsers])

  useEffect(() => {
    fetchConversations()
  }, [activeId, fetchConversations])

  const handleJoinGroup = () => {
    const iit = user?.profile?.iit

    if (!iit) {
      toast.error('Please complete your IIT profile first')
      return
    }

    onJoinGroup(iit)
    fetchConversations()
  }

  const handleStartDM = async (userId) => {
    await onStartDM(userId)
    fetchConversations()
  }

  return (
    <aside className="w-full md:w-[420px] shrink-0
      border-r border-slate-800 bg-slate-950
      p-4 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Chats
        </h2>

        <button
          onClick={fetchConversations}
          className="border border-slate-800 rounded-xl
            px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="text-sm text-slate-400">
          Search students
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Student name / roll number / email / IIT"
          className="w-full mt-2 rounded-xl
            bg-slate-900 border border-slate-800
            px-4 py-3 text-white outline-none
            focus:border-indigo-500"
        />
      </div>

      {/* IIT Group */}
      <button
        onClick={handleJoinGroup}
        className="w-full rounded-xl bg-indigo-600
          hover:bg-indigo-500 text-white font-semibold
          py-3 transition"
      >
        Join IIT Group
      </button>

      {/* Conversations */}
      <div>
        <div className="flex justify-between mb-3">
          <h3 className="text-sm text-slate-400">
            Your conversations
          </h3>

          {loading && (
            <span className="text-xs text-slate-500">
              Loading...
            </span>
          )}
        </div>

        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left rounded-2xl
                border p-3 transition ${
                  activeId === conversation._id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 hover:bg-slate-900'
                }`}
            >
              <div className="font-semibold text-white">
                {getConversationName(conversation)}
              </div>

              <p className="text-sm text-slate-400 truncate">
                {conversation.lastMessageText ||
                  'No messages yet'}
              </p>
            </button>
          ))}

          {!loading && conversations.length === 0 && (
            <p className="text-sm text-slate-500">
              No conversations yet.
            </p>
          )}
        </div>
      </div>

      {/* Students */}
      {requestTab === 'people' && <div>
      {requestTab === 'people' && <div>
        <h3 className="text-sm text-slate-400 mb-3">
          Students
        </h3>

        <div className="space-y-3">
          {users.map((student) => (
            <div
              key={student._id}
              className="border border-slate-800
                rounded-2xl p-3"
            >
              <h4 className="font-semibold text-white">
                {getUserName(student)}
              </h4>

              <p className="text-xs text-slate-400 mt-1">
                {student.profile?.iit || 'IIT'}
              </p>

              {relation(student._id) === 'connected' ? <button
                onClick={() => handleStartDM(student._id)}
                className="w-full mt-3 rounded-xl
                  bg-indigo-600 hover:bg-indigo-500
                  text-white font-semibold py-2"
              >
                Message
              </button> : relation(student._id) === 'pending' ? <button disabled className="w-full mt-3 rounded-xl bg-slate-800 text-slate-400 py-2">Request sent</button> : relation(student._id) === 'incoming' ? <button onClick={() => setRequestTab('requests')} className="w-full mt-3 rounded-xl bg-indigo-600 text-white py-2">Respond to request</button> : <button onClick={() => connect(student._id)} className="w-full mt-3 rounded-xl bg-indigo-600 text-white py-2">Connect</button>}
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-sm text-slate-500">
              No students found.
            </p>
          )}
        </div>
      </div>}
    </aside>
  )
}
