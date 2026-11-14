import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Calendar, Image as ImageIcon, TrendingUp, ChevronRight, Sparkles } from 'lucide-react'
import { api } from '../../utils/api'
import { formatDateTime, formatDate } from '../../utils/formatters'
import Loader from '../../components/common/Loader.jsx'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

export default function HomeFeed() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [gallery, setGallery] = useState([])
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [hoveredGallery, setHoveredGallery] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [eventsRes, galleryRes] = await Promise.all([
        api.get('/events'),
        api.get('/gallery')
      ])
      setEvents(eventsRes.data.upcoming.slice(0, 6))
      setGallery(galleryRes.data.posts.slice(0, 6))
    } catch (e) {
      toast.error('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader />
    </div>
  )

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={item}
        className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950/30 via-slate-950/60 to-purple-950/30 p-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_70%)]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-4"
          >
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Welcome to IIT Connect</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Your Campus Hub
          </h1>
          <p className="mt-3 text-slate-400 text-lg max-w-3xl leading-relaxed">
            Stay connected with your IIT community. Discover upcoming events, explore galleries, 
            and never miss important placement opportunities—all in one place.
          </p>
        </div>
      </motion.div>

      {/* Upcoming Events Section */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30"
            >
              <Calendar size={24} className="text-indigo-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <p className="text-sm text-slate-400">Don't miss out on exciting happenings</p>
            </div>
          </div>
          <motion.a
            href="/app/events"
            whileHover={{ x: 5 }}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View All <ChevronRight size={20} />
          </motion.a>
        </div>

        {events.length > 0 ? (
          <motion.div 
            variants={container}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event, idx) => (
              <motion.div
                key={event._id}
                variants={item}
                whileHover={{ y: -8, scale: 1.02 }}
                onHoverStart={() => setHoveredEvent(idx)}
                onHoverEnd={() => setHoveredEvent(null)}
                className="group relative rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300"
              >
                {/* Image with overlay */}
                {event.posterUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      animate={{ scale: hoveredEvent === idx ? 1.1 : 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredEvent === idx ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"
                    />
                  </div>
                )}
                
                <div className="p-5">
                  <motion.div
                    animate={{ x: hoveredEvent === idx ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">{event.iit}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
                      {formatDateTime(event.datetime)}
                    </div>
                    {event.venue && (
                      <p className="mt-2 text-xs text-slate-500">📍 {event.venue}</p>
                    )}
                  </motion.div>
                </div>

                {/* Hover Effect Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-indigo-500/0 group-hover:border-indigo-500/50 transition-colors duration-300"
                  animate={{
                    boxShadow: hoveredEvent === idx ? '0 0 30px rgba(99, 102, 241, 0.3)' : '0 0 0px rgba(99, 102, 241, 0)'
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-950/30"
          >
            <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400">No upcoming events yet</p>
          </motion.div>
        )}
      </motion.section>

      {/* Gallery Section */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30"
            >
              <ImageIcon size={24} className="text-purple-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Campus Gallery</h2>
              <p className="text-sm text-slate-400">Moments captured by our community</p>
            </div>
          </div>
          <motion.a
            href="/app/gallery"
            whileHover={{ x: 5 }}
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            View All <ChevronRight size={20} />
          </motion.a>
        </div>

        {gallery.length > 0 ? (
          <motion.div 
            variants={container}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {gallery.map((post, idx) => (
              <motion.div
                key={post._id}
                variants={item}
                whileHover={{ y: -8, scale: 1.02 }}
                onHoverStart={() => setHoveredGallery(idx)}
                onHoverEnd={() => setHoveredGallery(null)}
                className="group relative rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-sm overflow-hidden cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={post.imageUrl}
                    alt="gallery"
                    className="w-full h-full object-cover"
                    animate={{ scale: hoveredGallery === idx ? 1.15 : 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredGallery === idx ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {post.caption && (
                        <p className="text-sm text-white font-medium line-clamp-2">{post.caption}</p>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      {post.authorId?.profile?.name || 'Student'}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{post.iit}</p>
                </div>

                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-purple-500/0 group-hover:border-purple-500/50 transition-colors duration-300"
                  animate={{
                    boxShadow: hoveredGallery === idx ? '0 0 30px rgba(168, 85, 247, 0.3)' : '0 0 0px rgba(168, 85, 247, 0)'
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-950/30"
          >
            <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400">No gallery posts yet</p>
          </motion.div>
        )}
      </motion.section>

      {/* Quick Actions */}
      <motion.div
        variants={item}
        className="grid md:grid-cols-3 gap-4"
      >
        {[
          { 
            title: 'Placement Updates',
            desc: 'View latest opportunities',
            icon: TrendingUp,
            color: 'from-emerald-500/20 to-green-500/20',
            borderColor: 'border-emerald-500/30',
            iconColor: 'text-emerald-400',
            link: '/app/placements'
          },
          {
            title: 'Chat Rooms',
            desc: 'Connect with peers',
            icon: Sparkles,
            color: 'from-blue-500/20 to-cyan-500/20',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            link: '/app/chat'
          },
          {
            title: 'Your Profile',
            desc: 'Update your information',
            icon: Calendar,
            color: 'from-orange-500/20 to-red-500/20',
            borderColor: 'border-orange-500/30',
            iconColor: 'text-orange-400',
            link: '/app/profile'
          }
        ].map((action, idx) => (
          <motion.a
            key={action.title}
            href={action.link}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`block rounded-2xl border ${action.borderColor} bg-gradient-to-br ${action.color} backdrop-blur-sm p-6 transition-all duration-300`}
          >
            <action.icon size={32} className={`${action.iconColor} mb-3`} />
            <h3 className="font-bold text-lg">{action.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{action.desc}</p>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  )
}
