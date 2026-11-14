import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Input from '../common/Input'
import { api } from '../../utils/api'
import { formatDate } from '../../utils/formatters'

export default function GalleryCard({ post }) {
  const [likes, setLikes] = useState(0)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  async function loadLikes() {
    const { data } = await api.get('/likes', { params: { targetType: 'GalleryPost', targetId: post._id } })
    setLikes(data.count)
  }

  async function toggleLike() {
    await api.post('/likes/toggle', { targetType: 'GalleryPost', targetId: post._id })
    loadLikes()
  }

  async function loadComments() {
    const { data } = await api.get('/comments', { params: { targetType: 'GalleryPost', targetId: post._id } })
    setComments(data.comments)
  }

  async function addComment() {
    if (!text.trim()) return
    await api.post('/comments', { targetType: 'GalleryPost', targetId: post._id, text })
    setText('')
    loadComments()
  }

  useEffect(() => {
    loadLikes().catch(() => {})
  }, [])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
      <img src={post.imageUrl} alt="gallery" className="w-full h-56 object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{post.authorId?.profile?.name || post.authorId?.email || 'Student'}</div>
          <div className="text-xs text-slate-400">{formatDate(post.createdAt)}</div>
        </div>
        <div className="mt-1 text-xs text-slate-400">{post.iit}</div>
        {post.caption ? <div className="mt-2 text-sm text-slate-200">{post.caption}</div> : null}

        <div className="mt-3 flex gap-2">
          <Button variant="ghost" onClick={toggleLike}>Like • {likes}</Button>
          <Button variant="ghost" onClick={() => { setOpen(true); loadComments().catch(() => {}) }}>
            Comments
          </Button>
        </div>
      </div>

      <Modal open={open} title="Comments" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div className="space-y-2 max-h-[40vh] overflow-auto">
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
