import React from 'react'
import { motion } from 'framer-motion'
import GalleryCard from './GalleryCard'

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
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export default function GalleryGrid({ posts }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {posts.map((p) => (
        <motion.div
          key={p._id}
          variants={item}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <GalleryCard post={p} />
        </motion.div>
      ))}
    </motion.div>
  )
}
