import { motion, useScroll, useSpring } from 'framer-motion';
import { useRef } from 'react';

export function NeonConnector({ direction = 'ltr' }: { direction?: 'ltr' | 'rtl' }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"]
  });
  
  const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="w-full h-24 md:hidden relative -my-12 z-0 pointer-events-none">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`neon-grad-${direction}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(124,58,237,0)" />
            <stop offset="50%" stopColor="rgba(124,58,237,0.8)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </linearGradient>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background track (very faint) */}
        <path
          d={direction === 'ltr' ? "M 15 0 C 15 50, 85 50, 85 100" : "M 85 0 C 85 50, 15 50, 15 100"}
          fill="transparent"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* Animated glowing neon path */}
        <motion.path
          d={direction === 'ltr' ? "M 15 0 C 15 50, 85 50, 85 100" : "M 85 0 C 85 50, 15 50, 15 100"}
          fill="transparent"
          stroke={`url(#neon-grad-${direction})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          filter="url(#neon-glow)"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
}
