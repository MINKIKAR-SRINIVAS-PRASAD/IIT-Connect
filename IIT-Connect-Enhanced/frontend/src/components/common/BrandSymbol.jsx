import React from 'react'

export default function BrandSymbol({ className = 'h-9 w-auto max-w-[76px] object-contain', alt = 'Gold IIT logo' }) {
  return <img src="/iitconnect-gold-logo.svg" className={className} alt={alt} draggable="false" />
}
