import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Users, Shield, Zap } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_55%)]" />
      
      {/* Animated Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:64px_64px]"
      />

      <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={item} className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 backdrop-blur-sm px-4 py-2 text-sm text-slate-300 shadow-lg">
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-emerald-400"
              />
              Private IIT-only community
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={item}
            className="mt-8 text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              IIT Connect
            </span>
          </motion.h1>

          <motion.div 
            variants={item}
            className="mt-6 text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-300"
          >
            One platform for every{' '}
            <motion.span
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto]"
            >
              IIT student
            </motion.span>
          </motion.div>

          {/* Description */}
          <motion.p 
            variants={item}
            className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Verified IIT-email access, real-time chat, galleries, placement experiences and events—moderated by admins for a safe community.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={item}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-lg overflow-hidden transition-all duration-300"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto]"
                  animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative flex items-center gap-2">
                  <Sparkles size={20} />
                  SIGN UP FOR FREE
                </span>
              </motion.button>
            </Link>
            
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl border-2 border-slate-700 hover:border-indigo-500 bg-slate-900/50 backdrop-blur-sm font-semibold text-lg transition-all duration-300"
              >
                SIGN IN 
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            variants={container}
            className="mt-20 grid md:grid-cols-3 gap-6"
          >
            {[
              { 
                icon: Zap, 
                title: 'Real-time Chat', 
                desc: 'DM + IIT group rooms with typing & seen indicators.',
                color: 'from-yellow-500/20 to-orange-500/20'
              },
              { 
                icon: Shield, 
                title: 'Admin Approvals', 
                desc: 'Gallery, placements & events are carefully moderated.',
                color: 'from-green-500/20 to-emerald-500/20'
              },
              { 
                icon: Users, 
                title: 'Verified Access', 
                desc: 'Only IIT email domains—root + subdomains allowed.',
                color: 'from-blue-500/20 to-indigo-500/20'
              }
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ 
                  y: -8, 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  borderColor: 'rgba(99, 102, 241, 0.5)'
                }}
                className={`group rounded-2xl border border-slate-800 bg-gradient-to-br ${feature.color} backdrop-blur-sm p-6 transition-all duration-300`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex p-3 rounded-xl bg-slate-900/80 mb-4"
                >
                  <feature.icon size={28} className="text-indigo-400" />
                </motion.div>
                <div className="font-bold text-xl mb-2">{feature.title}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{feature.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-indigo-500 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}
