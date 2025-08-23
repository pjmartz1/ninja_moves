"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AnimatedFeatureIconProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export function AnimatedFeatureIcon({
  icon: Icon,
  title,
  description,
  delay = 0,
  className,
}: AnimatedFeatureIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      className={cn(
        "group p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer",
        className
      )}
    >
      {/* Animated Icon Container */}
      <motion.div
        className="relative w-20 h-20 mx-auto mb-6"
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          initial={{ scale: 0.8 }}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Main Icon Container */}
        <motion.div
          className="relative z-10 w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-500"
          whileHover={{
            background: [
              "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
              "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
              "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.3 }}
          >
            <Icon 
              className="w-10 h-10 text-white drop-shadow-lg" 
              strokeWidth={2.5}
            />
          </motion.div>
        </motion.div>

        {/* Floating Particles */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100"
          animate={{
            y: [0, -20, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100"
          animate={{
            y: [0, -15, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </motion.div>

      {/* Animated Title */}
      <motion.h3
        className="text-xl font-bold mb-4 text-gray-800 text-center group-hover:text-orange-600 transition-colors duration-300"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Animated Description */}
      <motion.p
        className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Hover Border Animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent"
        whileHover={{
          borderColor: "rgb(249 115 22)",
          boxShadow: "0 0 30px rgba(249, 115, 22, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}