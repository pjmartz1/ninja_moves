"use client";
import { useState } from "react";
import { PDFTableProHero } from "./hero-highlight-demo";
import { motion } from "framer-motion";

export function HeroDemoVariations() {
  const [selectedBackground, setSelectedBackground] = useState<'orange' | 'blue' | 'purple' | 'green' | 'warm' | 'cool'>('orange');
  const [waveColor, setWaveColor] = useState('#ffffff');

  const backgroundOptions = [
    { key: 'orange', name: 'Orange Gradient', preview: 'bg-gradient-to-br from-orange-50 via-white to-amber-50' },
    { key: 'blue', name: 'Blue Gradient', preview: 'bg-gradient-to-br from-blue-50 via-white to-sky-50' },
    { key: 'purple', name: 'Purple Gradient', preview: 'bg-gradient-to-br from-purple-50 via-white to-indigo-50' },
    { key: 'green', name: 'Green Gradient', preview: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50' },
    { key: 'warm', name: 'Warm Gradient', preview: 'bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50' },
    { key: 'cool', name: 'Cool Gradient', preview: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50' }
  ];

  const waveColorOptions = [
    { color: '#ffffff', name: 'White' },
    { color: '#f8fafc', name: 'Slate 50' },
    { color: '#f1f5f9', name: 'Slate 100' },
    { color: '#fef3c7', name: 'Amber 100' },
    { color: '#fee2e2', name: 'Rose 100' },
    { color: '#e0f2fe', name: 'Sky 100' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Controls */}
      <div className="bg-white border-b p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Hero Section Customization</h2>
          
          {/* Background Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Background Options:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {backgroundOptions.map((option) => (
                <motion.button
                  key={option.key}
                  onClick={() => setSelectedBackground(option.key as any)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedBackground === option.key
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-full h-8 rounded mb-2 ${option.preview}`}></div>
                  <span className="text-sm font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wave Color Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Wave Color:</h3>
            <div className="flex flex-wrap gap-3">
              {waveColorOptions.map((option) => (
                <motion.button
                  key={option.color}
                  onClick={() => setWaveColor(option.color)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    waveColor === option.color
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: option.color }}
                  ></div>
                  <span className="text-sm font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Current Settings */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Current Configuration:</h4>
            <code className="text-sm text-gray-700">
              backgroundVariant="{selectedBackground}" waveColor="{waveColor}"
            </code>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="relative">
        <PDFTableProHero 
          backgroundVariant={selectedBackground}
          waveColor={waveColor}
        />
        
        {/* Sample section below to show wave effect */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600">
              This section shows how the S-shaped wave creates a smooth transition
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}