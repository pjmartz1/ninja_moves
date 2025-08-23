'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SimpleFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

function SimpleFeatureCard({ icon: Icon, title, description }: SimpleFeatureCardProps) {
  return (
    <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
          <Icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 text-gray-800 text-center group-hover:text-orange-600 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
        {description}
      </p>
    </div>
  )
}

interface SimpleFeaturesProps {
  features: Array<{
    icon: LucideIcon
    title: string
    description: string
  }>
}

export function SimpleFeatures({ features }: SimpleFeaturesProps) {
  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <SimpleFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.2 * (index + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}