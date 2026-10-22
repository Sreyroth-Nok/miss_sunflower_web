'use client';

import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        transformOrigin: '0%',
        background: 'linear-gradient(to right, #F7C928, #C99A25, #F7C928)',
        zIndex: 9999,
        boxShadow: '0 0 8px rgba(247,201,40,0.6)',
      }}
    />
  );
}
