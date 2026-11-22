import React from 'react'

export default function BrandSymbol({ className = 'h-9 w-auto max-w-[76px] object-contain', alt = 'IITStudentsOS official gold IIT logo' }) {
  return <img src="/iitconnect-gold-logo.svg" alt={alt} className={className} draggable="false" />
}
