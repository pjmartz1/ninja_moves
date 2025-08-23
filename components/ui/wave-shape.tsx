"use client";
import { motion } from "framer-motion";

interface WaveShapeProps {
  className?: string;
  fillColor?: string;
  variant?: 'subtle' | 'moderate' | 'dramatic';
}

export const WaveShape = ({ 
  className = "", 
  fillColor = "#ffffff",
  variant = "moderate"
}: WaveShapeProps) => {
  // Different wave patterns based on variant
  const wavePatterns = {
    subtle: "M0,96L120,101.3C240,107,480,117,720,112C960,107,1200,85,1440,85.3L1680,85L1920,96L2160,101.3C2400,107,2640,117,2880,112C3120,107,3360,85,3480,74.7L3600,64L3600,128L3480,128C3360,128,3120,128,2880,128C2640,128,2400,128,2160,128L1920,128L1680,128L1440,128C1200,128,960,128,720,128C480,128,240,128,120,128L0,128Z",
    moderate: "M0,64L120,69.3C240,75,480,85,720,80C960,75,1200,53,1440,53.3L1680,53L1920,64L2160,69.3C2400,75,2640,85,2880,80C3120,75,3360,53,3480,42.7L3600,32L3600,128L3480,128C3360,128,3120,128,2880,128C2640,128,2400,128,2160,128L1920,128L1680,128L1440,128C1200,128,960,128,720,128C480,128,240,128,120,128L0,128Z",
    dramatic: "M0,32L120,42.7C240,53,480,75,720,69.3C960,64,1200,32,1440,32L1680,32L1920,42.7L2160,53.3C2400,64,2640,96,2880,96C3120,96,3360,64,3480,48L3600,32L3600,128L3480,128C3360,128,3120,128,2880,128C2640,128,2400,128,2160,128L1920,128L1680,128L1440,128C1200,128,960,128,720,128C480,128,240,128,120,128L0,128Z"
  };

  return (
    <div className={`absolute bottom-0 left-0 w-full overflow-hidden leading-none ${className}`}>
      <motion.svg
        className="relative block w-full h-16"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 3600 128"
        fill={fillColor}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.path
          d={wavePatterns[variant]}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
};

// Pre-configured wave variations for easy use
export const SShapeWave = (props: Omit<WaveShapeProps, 'variant'>) => (
  <WaveShape {...props} variant="moderate" />
);

export const SubtleWave = (props: Omit<WaveShapeProps, 'variant'>) => (
  <WaveShape {...props} variant="subtle" />
);

export const DramaticWave = (props: Omit<WaveShapeProps, 'variant'>) => (
  <WaveShape {...props} variant="dramatic" />
);