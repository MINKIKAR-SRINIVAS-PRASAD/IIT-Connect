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
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [approved, mine] = await Promise.all([api.get('/gallery'), api.get('/gallery/mine')])
      const merged = [...(mine.data.posts || []), ...(approved.data.posts || [])]
      setPosts(Array.from(new Map(merged.map((post) => [post._id, post])).values()).filter((post) => post.status !== 'Deleted'))
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
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
      <CreatePostPanel title="Share a campus moment" description="Upload a photo or memory for the IIT community. Posts are reviewed before publication." buttonLabel="Add photo"><GalleryUpload onCreated={() => { toast.success('Photo uploaded! Awaiting admin approval'); load() }} /></CreatePostPanel>

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
