'use client';

import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Inertial wheel scrolling for the whole page. Lenis still drives the native
// scroll position, so scroll-linked animations (useScroll, window.scrollY) keep working.
export default function SmoothScroll() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      anchors: true,
      autoRaf: true,
    });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, [reduceMotion]);

  return null;
}
