"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { SShapeWave } from "@/components/ui/wave-shape";

interface PDFTableProHeroProps {
  backgroundVariant?: 'orange' | 'blue' | 'purple' | 'green' | 'warm' | 'cool';
  waveColor?: string;
}

export function PDFTableProHero({ 
  backgroundVariant = 'orange',
  waveColor = '#ffffff'
}: PDFTableProHeroProps) {
  // Background color options
  const backgroundOptions = {
    orange: "bg-gradient-to-br from-orange-50 via-white to-amber-50",
    blue: "bg-gradient-to-br from-blue-50 via-white to-sky-50",
    purple: "bg-gradient-to-br from-purple-50 via-white to-indigo-50", 
    green: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    warm: "bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50",
    cool: "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
  };

  return (
    <HeroHighlight containerClassName={backgroundOptions[backgroundVariant]}>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-center px-4 max-w-4xl mx-auto"
      >
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Extract PDF Tables to Excel in{" "}
          <Highlight className="bg-gradient-to-r from-orange-300 to-amber-300 text-orange-900">
            10 Seconds
          </Highlight>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          AI-powered table extraction with{" "}
          <span className="font-semibold text-orange-600">95%+ accuracy</span>.{" "}
          <br className="hidden md:block" />
          No manual selection, no software installation, no accuracy nightmares.
        </motion.p>

      </motion.div>
      
      {/* S-shaped wave at bottom */}
      <SShapeWave 
        fillColor={waveColor}
        className="z-10"
      />
    </HeroHighlight>
  );
}