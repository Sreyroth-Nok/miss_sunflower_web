'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

type Mode = 'enter' | 'exit';

// Scroll-linked section transition.
// 'enter': the section rises, scales up and un-rounds as it scrolls into view.
// 'exit':  the section (e.g. the hero) recedes as it scrolls out of view.
export default function SectionReveal({ children, mode = 'enter' }: { children: React.ReactNode; mode?: Mode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: mode === 'enter' ? ['start end', 'start 0.25'] : ['start start', 'end start'],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  const enterY       = useTransform(p, [0, 1], [90, 0]);
  const enterScale   = useTransform(p, [0, 1], [0.94, 1]);
  const enterOpacity = useTransform(p, [0, 0.6], [0.35, 1]);
  const enterRadius  = useTransform(p, [0, 1], [36, 0]);

  const exitY       = useTransform(p, [0, 1], [0, 120]);
  const exitScale   = useTransform(p, [0, 1], [1, 0.92]);
  const exitOpacity = useTransform(p, [0, 1], [1, 0.35]);

  if (reduceMotion) return <div ref={ref}>{children}</div>;

  const style =
    mode === 'enter'
      ? { y: enterY, scale: enterScale, opacity: enterOpacity, borderRadius: enterRadius }
      : { y: exitY, scale: exitScale, opacity: exitOpacity };

  return (
    <motion.div
      ref={ref}
      style={{ ...style, overflow: 'clip', transformOrigin: mode === 'enter' ? '50% 0%' : '50% 100%', willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
