import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import GalleryUpload from '../../components/gallery/GalleryUpload.jsx'
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sage-page-theme space-y-6"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-hero relative overflow-hidden rounded-3xl border border-[#a8c49a]/20 bg-[radial-gradient(ellipse_at_85%_5%,rgba(115,145,105,.22),transparent_38%),linear-gradient(120deg,#1b2820,#26382c_58%,#1b2a23)] p-6 md:p-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#a8c49a]/15 blur-3xl"
        />
        
        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border border-[#a8c49a]/25 bg-[#a8c49a]/10 p-3"
          >
            <ImageIcon size={28} className="text-[#b6d0a8]" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f0f1e8]">
              Campus Gallery
            </h1>
            <p className="mt-1 text-[#c1cbbd]">Share and explore campus moments</p>
          </div>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        className="hidden md:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GalleryUpload onCreated={() => {
          toast.success('Photo uploaded! Awaiting admin approval')
          load()
        }} />
      </motion.div>

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
