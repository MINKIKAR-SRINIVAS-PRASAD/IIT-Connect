import React from 'react'

export default function BrandSymbol({ className = 'h-9 w-auto max-w-[76px] object-contain', alt = 'IIT Connect uploaded emblem' }) {
  return <img src="/iit-connect-emblem.png" className={className} alt={alt} />
}
