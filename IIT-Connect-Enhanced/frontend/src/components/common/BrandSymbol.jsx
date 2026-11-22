import React from 'react'

export default function BrandSymbol({ className = 'h-9 w-auto max-w-[76px] object-contain', alt = 'IITConnect network logo' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 48"
      role="img"
      aria-label={alt}
      focusable="false"
    >
      <defs>
        <linearGradient id="iit-connect-shared-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6b987" />
          <stop offset="100%" stopColor="#a8c49a" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#iit-connect-shared-mark)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 24h22M39 24l18-14M39 24l18 14M57 10h20M57 38h20" />
      </g>
      <g fill="#d6b987">
        <circle cx="17" cy="24" r="6" />
        <circle cx="39" cy="24" r="6" />
        <circle cx="57" cy="10" r="6" />
        <circle cx="57" cy="38" r="6" />
        <circle cx="77" cy="10" r="5" />
        <circle cx="77" cy="38" r="5" />
      </g>
    </svg>
  )
}
