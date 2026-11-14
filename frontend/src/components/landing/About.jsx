import React from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Award, Globe } from 'lucide-react'

export default function About() {
  const highlights = [
    { icon: Users, label: 'Connect', desc: 'With students from all IITs' },
    { icon: BookOpen, label: 'Share', desc: 'Knowledge and resources' },
    { icon: Award, label: 'Grow', desc: 'Skills through collaboration' },
    { icon: Globe, label: 'Network', desc: 'Build connections nationwide' }
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-900 p-8 md:p-12 overflow-hidden"
      >
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6"
          >
            <span className="text-sm font-medium text-indigo-300">Our Mission</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
          >
            About IIT Connect
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-6 space-y-4 text-slate-300 leading-relaxed text-lg"
          >
            <p>
              IIT Connect is a platform created to bring all IIT students across India onto one common network.
              As an IIT student, I felt that students from different IITs have a lot of knowledge, experience, 
              and opportunities — but there is no single place where everyone can connect and share.
            </p>
            
            <p className="text-slate-400">
              This platform is built to help IIT students achieve their goals through collaboration and community.
            </p>
          </motion.div>

          {/* Highlights Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {highlights.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 text-center transition-all duration-300 hover:border-indigo-500/50"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex p-2 rounded-lg bg-indigo-500/20 mb-2"
                >
                  <item.icon size={24} className="text-indigo-400" />
                </motion.div>
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-slate-800"
          >
            <p className="text-slate-400 text-center">
              The main goal of IIT Connect is to create a strong community where students can build 
              real connections all over India and improve their skills through sharing and collaboration.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
