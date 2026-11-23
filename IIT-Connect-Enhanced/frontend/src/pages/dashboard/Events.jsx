import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import EventCreate from '../../components/events/EventCreate.jsx'
import CreatePostPanel from '../../components/common/CreatePostPanel.jsx'
import EventCard from '../../components/events/EventCard.jsx'
import EventDetailsModal from '../../components/events/EventDetailsModal.jsx'
import Loader from '../../components/common/Loader.jsx'
import { Calendar, Clock, Sparkles } from 'lucide-react'
import { api } from '../../utils/api'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

export default function Events() {
  const [loading, setLoading] = useState(true)
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [selected, setSelected] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/events')
      setUpcoming(data.upcoming)
      setPast(data.past)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load events')
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
    <CreatePostPanel title="Create a campus event" description="Share an event with students and faculty across the IIT community." buttonLabel="Add event"><EventCreate onCreated={() => { toast.success('Event submitted! Awaiting admin approval'); load() }} /></CreatePostPanel>

      {/* Upcoming Events */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="font-semibold text-emerald-300">Upcoming Events</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
        </motion.div>

        {upcoming.length > 0 ? (
          <motion.div 
            variants={container}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {upcoming.map((e) => (
              <motion.div
                key={e._id}
                variants={item}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <EventCard event={e} onOpen={(ev) => setSelected(ev)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-950/30"
          >
            <Clock size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400">No upcoming events yet. Be the first to create one!</p>
          </motion.div>
        )}
      </motion.section>

      {/* Past Events */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/30 border border-slate-700/50">
            <Calendar size={16} className="text-slate-400" />
            <span className="font-semibold text-slate-300">Past Events</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
        </motion.div>

        {past.length > 0 ? (
          <motion.div 
            variants={container}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {past.map((e) => (
              <motion.div
                key={e._id}
                variants={item}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <EventCard event={e} onOpen={(ev) => setSelected(ev)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={item}
            className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-950/30"
          >
            <p className="text-slate-500">No past events to display</p>
          </motion.div>
        )}
      </motion.section>

      <EventDetailsModal open={!!selected} event={selected} onClose={() => setSelected(null)} />
    </motion.div>
  )
}
