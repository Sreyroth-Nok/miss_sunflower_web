'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

type Mode = 'enter' | 'exit';

// Scroll-linked section transition, compositor-only (transform + opacity) so it never repaints.
// 'enter': the section rises and scales up as it scrolls into view.
// 'exit':  the section (e.g. the hero) recedes as it scrolls out of view.
// No spring: Lenis already smooths the scroll, a second smoothing layer would only add lag.
export default function SectionReveal({ children, mode = 'enter' }: { children: React.ReactNode; mode?: Mode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: mode === 'enter' ? ['start end', 'start 0.25'] : ['start start', 'end start'],
  });

  const enterY       = useTransform(p, [0, 1], [80, 0]);
  const enterScale   = useTransform(p, [0, 1], [0.95, 1]);
  const enterOpacity = useTransform(p, [0, 0.6], [0.4, 1]);

  const exitY       = useTransform(p, [0, 1], [0, 120]);
  const exitScale   = useTransform(p, [0, 1], [1, 0.92]);
  const exitOpacity = useTransform(p, [0, 1], [1, 0.35]);

  if (reduceMotion) return <div ref={ref}>{children}</div>;

  const style =
    mode === 'enter'
      ? { y: enterY, scale: enterScale, opacity: enterOpacity }
      : { y: exitY, scale: exitScale, opacity: exitOpacity };

  return (
    <motion.div
      ref={ref}
      style={{ ...style, transformOrigin: mode === 'enter' ? '50% 0%' : '50% 100%', willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
