import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Input from '../common/Input'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

export default function PlacementCard({ post, onDeleted }) {
  const { user } = useAuth()
  const isOwner = String(post.authorId?._id || post.authorId) === String(user?._id || user?.id)
  const canDelete = isOwner || user?.role === 'admin'
  const [deleting, setDeleting] = useState(false)
  async function deletePost() {
    if (!window.confirm('Delete this placement post for everyone?')) return
    setDeleting(true)
    try { await api.delete('/placements/' + post._id); toast.success('Placement post deleted'); onDeleted?.() }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not delete post') }
    finally { setDeleting(false) }
  }
  const [likes, setLikes] = useState(0)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  async function loadLikes() {
    const { data } = await api.get('/likes', { params: { targetType: 'PlacementPost', targetId: post._id } })
    setLikes(data.count)
  }

  async function toggleLike() {
    await api.post('/likes/toggle', { targetType: 'PlacementPost', targetId: post._id })
    loadLikes()
  }

  async function loadComments() {
    const { data } = await api.get('/comments', { params: { targetType: 'PlacementPost', targetId: post._id } })
    setComments(data.comments)
  }

  async function addComment() {
    if (!text.trim()) return
    await api.post('/comments', { targetType: 'PlacementPost', targetId: post._id, text })
    setText('')
    loadComments()
  }

  useEffect(() => {
    loadLikes().catch(() => {})
  }, [])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{post.companyName}</div>
          <div className="text-sm text-slate-300">{post.role}{post.ctc ? ` • ${post.ctc}` : ''}</div>
          <div className="text-xs text-slate-500 mt-1">{formatDate(post.createdAt)}</div>
        </div>
        <div className="text-xs text-slate-400">{post.authorId?.profile?.name || post.authorId?.email}</div>
      </div>

      {post.tips ? <div className="mt-3 text-sm text-slate-200">Tips: {post.tips}</div> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={toggleLike}>Like • {likes}</Button>
        <Button variant="ghost" onClick={() => { setOpen(true); loadComments().catch(() => {}) }}>Comments</Button>
        {canDelete && <button disabled={deleting} onClick={deletePost} className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-300 disabled:opacity-50">{deleting?'Deleting…':isOwner?'Delete post':'Admin · Delete post'}</button>}
      </div>

      <Modal open={open} title="Placement Details" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 p-3">
            <div className="text-sm font-semibold">Interview Questions</div>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-300 space-y-1">
              {(post.interviewQuestions || []).map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 p-3">
            <div className="text-sm font-semibold">Rounds</div>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-300 space-y-1">
              {(post.rounds || []).map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 max-h-[30vh] overflow-auto">
            {comments.map((c) => (
              <div key={c._id} className="rounded-xl border border-slate-800 p-3">
                <div className="text-xs text-slate-400">{c.authorId?.profile?.name || c.authorId?.email}</div>
                <div className="text-sm mt-1">{c.text}</div>
              </div>
            ))}
            {!comments.length ? <div className="text-sm text-slate-400">No comments yet.</div> : null}
          </div>

          <div className="flex gap-2">
            <Input className="flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
            <Button onClick={() => addComment().catch((e) => toast.error(e?.response?.data?.message || 'Failed'))}>Send</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
