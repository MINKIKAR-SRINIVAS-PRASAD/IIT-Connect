import React from 'react'

export default function BrandSymbol({ className = 'h-9 w-auto max-w-[76px] object-contain', alt = 'IIT Connect symbol' }) {
  // Keep the brand mark self-contained: the old /iitconnect-gold-logo.svg asset
  // was missing from public/, which rendered a broken-image icon in both sidebars.
  return (
    <svg viewBox="0 0 72 48" role="img" aria-label={alt} className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect x="2" y="2" width="68" height="44" rx="13" fill="#A8C49A" fillOpacity=".12" stroke="#A8C49A" strokeOpacity=".55"/>
      <path d="M18 15h13v13H18zM41 20h13v13H41zM31 21l10 4M24.5 28v6M47.5 20v-5" stroke="#D8B45A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24.5" cy="15" r="3" fill="#D8B45A"/><circle cx="47.5" cy="33" r="3" fill="#D8B45A"/>
    </svg>
  )
}
