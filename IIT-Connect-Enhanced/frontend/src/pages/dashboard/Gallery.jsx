import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import GalleryUpload from '../../components/gallery/GalleryUpload.jsx'
import CreatePostPanel from '../../components/common/CreatePostPanel.jsx'
import GalleryGrid from '../../components/gallery/GalleryGrid.jsx'
import Loader from '../../components/common/Loader.jsx'
import { ImageIcon, Sparkles } from 'lucide-react'
import { api } from '../../utils/api'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

export default function Gallery() {
  const [posts, setPosts] = useState([])
  const [myPending, setMyPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [approvedResult, mineResult, communityResult] = await Promise.allSettled([
        api.get('/gallery'), api.get('/gallery/mine'), api.get('/posts/feed')
      ])
      const approved = approvedResult.status === 'fulfilled' ? approvedResult.value.data.posts || [] : []
      const mine = mineResult.status === 'fulfilled' ? mineResult.value.data.posts || [] : []
      const community = communityResult.status === 'fulfilled'
        ? (communityResult.value.data.posts || []).filter(post => post.section === 'Gallery' && post.status === 'Approved').map(post => ({ ...post, _source: 'community' }))
        : []
      setMyPending(mine.filter(post => post.status !== 'Approved' && post.status !== 'Deleted'))
      if (approvedResult.status === 'rejected' && mineResult.status === 'rejected' && communityResult.status === 'rejected') {
        throw approvedResult.reason || mineResult.reason || communityResult.reason
      }
      const merged = [...community, ...approved]
      setPosts(Array.from(new Map(merged.map((post) => [post._id, post])).values()).filter((post) => post.status === 'Approved' && post.visibility !== 'private'))
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  async function deleteMySubmission(post) {
    if (!window.confirm('Delete this Gallery submission for everyone? This cannot be undone.')) return
    setDeletingId(String(post._id))
    try {
      await api.delete(`/gallery/${post._id}`)
      toast.success('Gallery submission deleted. Admin has been notified.')
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not delete submission')
    } finally { setDeletingId('') }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader />
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="sage-page-theme space-y-6">
      <CreatePostPanel title="Share a campus moment" description="Upload a photo or memory for the IIT community. Gallery photos remain pending until admin approval." buttonLabel="Add photo"><GalleryUpload onCreated={() => { load() }} /></CreatePostPanel>

      {/* Gallery Grid */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
            <Sparkles size={16} className="text-purple-400" />
            <span className="font-semibold text-purple-300">All Photos</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
          <span className="text-sm text-slate-500">{posts.length} {posts.length === 1 ? 'photo' : 'photos'}</span>
        </motion.div>

        {myPending.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[.04] p-4">
            <h3 className="mb-3 text-sm font-semibold text-amber-200">My submissions · visible only to you</h3>
            <div className="space-y-2">{myPending.map(post => (
              <div key={post._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm">
                <span className="text-slate-200">{post.caption || 'Photo submission'}</span>
                <div className="flex items-center gap-3"><span className={post.status === 'Rejected' ? 'text-rose-300' : 'text-amber-300'}>{post.status === 'Rejected' ? 'Rejected' : 'Awaiting admin approval'}</span><button disabled={deletingId===String(post._id)} onClick={()=>deleteMySubmission(post)} className="rounded-lg border border-rose-400/30 px-2.5 py-1 text-xs text-rose-300 disabled:opacity-50">{deletingId===String(post._id)?'Deleting…':'Delete'}</button></div>
              </div>
            ))}</div>
          </div>
        )}
        {posts.length > 0 ? (
          <motion.div variants={container}>
            <GalleryGrid posts={posts} />
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-950/30"
          >
            <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400">No photos yet. Be the first to share a moment!</p>
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  )
}
