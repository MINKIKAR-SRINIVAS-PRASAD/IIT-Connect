import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, ImageIcon, Briefcase, Calendar } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Chat System',
    desc: 'One-to-one + IIT group chat with online status, typing indicator, seen status and timestamps.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400'
  },
  {
    icon: ImageIcon,
    title: 'Gallery',
    desc: 'Upload campus moments to Cloudinary. Admin approves before it goes public.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400'
  },
  {
    icon: Briefcase,
    title: 'Placement Cell',
    desc: 'Post interview experiences with questions, rounds and tips. Search by company & filter by role.',
    gradient: 'from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-400'
  },
  {
    icon: Calendar,
    title: 'Events',
    desc: 'Submit events with posters and registration links. Upcoming vs past separation after approval.',
    gradient: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400'
  }
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

export default function Features() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6"
        >
          <span className="text-sm font-medium text-indigo-300">Powerful Features</span>
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Everything You Need
        </h2>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
          A comprehensive platform designed specifically for IIT students, by IIT students
        </p>
      </motion.div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-6"
      >
        {features.map((f, idx) => (
          <motion.div
            key={f.title}
            variants={item}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            className={`group relative rounded-2xl border border-slate-800 bg-gradient-to-br ${f.gradient} backdrop-blur-sm p-8 overflow-hidden transition-all duration-300`}
          >
            {/* Animated background blob */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.5
              }}
              className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${f.gradient} rounded-full blur-3xl`}
            />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex p-3 rounded-xl bg-slate-900/80 mb-4"
              >
                <f.icon size={32} className={f.iconColor} />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-slate-700/50 transition-all duration-300" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
