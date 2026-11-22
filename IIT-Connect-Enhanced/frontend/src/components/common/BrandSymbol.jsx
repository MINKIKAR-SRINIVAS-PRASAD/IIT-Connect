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
      <g fill="none" stroke="#d6b987" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
