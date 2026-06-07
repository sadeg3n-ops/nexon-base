import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useId, useRef } from 'react';

export function NeonConnector({ direction = 'ltr' }: { direction?: 'ltr' | 'rtl' }) {
  const ref = useRef<HTMLDivElement>(null);
  const connectorId = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 20%']
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const mobilePath =
    direction === 'ltr'
      ? 'M 15 0 C 15 50, 85 50, 85 100'
      : 'M 85 0 C 85 50, 15 50, 15 100';
  const desktopPath =
    direction === 'ltr'
      ? 'M 16 2 C 16 26, 40 28, 40 48 S 64 68, 64 92 S 82 116, 82 142'
      : 'M 84 2 C 84 26, 60 28, 60 48 S 36 68, 36 92 S 18 116, 18 142';

  const animatedPathLength = prefersReducedMotion ? 1 : pathLength;

  return (
    <div
      ref={ref}
      className="pointer-events-none relative z-0 -my-10 h-24 w-full overflow-hidden md:-my-12 md:h-32 lg:h-36"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full overflow-hidden md:hidden"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id={`neon-grad-mobile-${connectorId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(124,58,237,0)" />
            <stop offset="50%" stopColor="rgba(124,58,237,0.8)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </linearGradient>
          <filter id={`neon-glow-mobile-${connectorId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={mobilePath}
          fill="transparent"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        <motion.path
          d={mobilePath}
          fill="transparent"
          stroke={`url(#neon-grad-mobile-${connectorId})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          filter={`url(#neon-glow-mobile-${connectorId})`}
          style={{ pathLength: animatedPathLength }}
        />
      </svg>

      <div className="hidden h-full w-full md:block">
        <svg
          className="mx-auto h-full w-full max-w-[1240px] overflow-visible opacity-90"
          preserveAspectRatio="none"
          viewBox="0 0 100 144"
        >
          <defs>
            <linearGradient id={`neon-grad-desktop-${connectorId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59,130,246,0)" />
              <stop offset="35%" stopColor="rgba(59,130,246,0.55)" />
              <stop offset="68%" stopColor="rgba(124,58,237,0.8)" />
              <stop offset="100%" stopColor="rgba(124,58,237,0)" />
            </linearGradient>
            <filter id={`neon-glow-desktop-${connectorId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={desktopPath}
            fill="transparent"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />

          <motion.path
            d={desktopPath}
            fill="transparent"
            stroke={`url(#neon-grad-desktop-${connectorId})`}
            strokeWidth="1.8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter={`url(#neon-glow-desktop-${connectorId})`}
            style={{ pathLength: animatedPathLength }}
          />
        </svg>
      </div>
    </div>
  );
}
