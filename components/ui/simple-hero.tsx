'use client'

import React from 'react'

interface SimpleHeroProps {
  backgroundVariant?: 'orange' | 'blue' | 'purple' | 'green' | 'warm' | 'cool'
  waveColor?: string
}

export function SimpleHero({ 
  backgroundVariant = 'orange',
  waveColor = '#f97316'
}: SimpleHeroProps) {
  const backgroundOptions = {
    orange: "bg-gradient-to-br from-orange-50 via-white to-amber-50",
    blue: "bg-gradient-to-br from-blue-50 via-white to-sky-50",
    purple: "bg-gradient-to-br from-purple-50 via-white to-indigo-50", 
    green: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    warm: "bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50",
    cool: "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
  }

  return (
    <div className={`relative h-[28rem] flex items-center justify-center w-full ${backgroundOptions[backgroundVariant]}`}>
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(212 212 212) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-normal mb-8">
          Extract PDF Tables to Excel in{' '}
          <span className="relative inline-block pb-1 px-2 py-1 rounded-lg bg-orange-400 text-white">
            10 Seconds
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
          AI-powered table extraction with{' '}
          <span className="font-semibold text-orange-600">95%+ accuracy</span>.{' '}
          <br className="hidden md:block" />
          No manual selection, no software installation, no accuracy nightmares.
        </p>
      </div>
      
      {/* Wave shape at bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg 
          className="relative block w-full h-16" 
          viewBox="0 0 3600 128" 
          fill={waveColor}
        >
          <path d="M0,64L120,69.3C240,75,480,85,720,80C960,75,1200,53,1440,53.3L1680,53L1920,64L2160,69.3C2400,75,2640,85,2880,80C3120,75,3360,53,3480,42.7L3600,32L3600,128L3480,128C3360,128,3120,128,2880,128C2640,128,2400,128,2160,128L1920,128L1680,128L1440,128C1200,128,960,128,720,128C480,128,240,128,120,128L0,128Z" />
        </svg>
      </div>
    </div>
  )
}