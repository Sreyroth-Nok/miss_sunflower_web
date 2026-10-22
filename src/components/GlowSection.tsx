'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { scrollToSection } from '@/lib/scroll';

const STATS = [
  { value: 'SPF 50+', label: 'Sun Protection Factor' },
  { value: 'PA++++', label: 'UVA Protection Grade' },
  { value: '12H', label: 'Lasting Hydration' },
  { value: '0%', label: 'White Cast' },
];

export default function GlowSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.05, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Only play the video while it is on screen
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.25 });
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 lg:py-48"
      style={{
        background: 'linear-gradient(160deg, #FFF9EC 0%, #FFF3C4 40%, #FFF9EC 100%)',
      }}
    >
      {/* Large ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(247,201,40,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Floating sunflowers — parallax */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 left-8 lg:left-16 opacity-40 pointer-events-none"
      >
        <Image src="/images/products/flower1.png" alt="" width={220} height={220} className="object-contain" />
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-0 right-8 lg:right-16 opacity-35 pointer-events-none"
      >
        <Image src="/images/products/flower1.png" alt="" width={280} height={280} className="object-contain" />
      </motion.div>

      {/* Floating petals */}
      {[
        { top: '20%', left: '8%', size: 45, delay: 0 },
        { top: '65%', left: '12%', size: 32, delay: 1.2 },
        { top: '30%', right: '6%', size: 38, delay: 0.7 },
        { top: '70%', right: '10%', size: 28, delay: 2 },
      ].map((petal, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: petal.top, left: 'left' in petal ? petal.left : undefined, right: 'right' in petal ? petal.right : undefined }}
          animate={{ y: [-12, 12, -12], rotate: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: petal.delay }}
        >
          <Image src="/images/products/2.png" alt="" width={petal.size} height={petal.size} className="object-contain" />
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase mb-5"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#C99A25' }}
            >
              Your Glow Awaits
            </p>

            <h2
              className="mb-8"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                fontWeight: 600,
                color: '#332719',
                letterSpacing: '-0.02em',
                lineHeight: 1.08,
              }}
            >
              One serum.
              <br />
              <em style={{ color: '#C99A25' }}>Endless radiance.</em>
            </h2>

            <p
              className="mb-10 max-w-lg"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.95rem',
                color: '#5a4530',
                lineHeight: 1.8,
                opacity: 0.85,
              }}
            >
              Miss Sunflower Sun Serum isn&apos;t just sunscreen — it&apos;s the first step in
              your morning ritual. A weightless veil of protection that lets your true
              radiance shine through, every single day.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: '#332719',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.65rem',
                      color: '#C99A25',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA button */}
            <motion.a
              href="#product"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#product');
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #F7C928 0%, #C99A25 100%)',
                color: '#332719',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 32px rgba(199,154,37,0.35)',
                textDecoration: 'none',
              }}
            >
              Explore the Serum
              <span className="text-base">→</span>
            </motion.a>
          </motion.div>

          {/* Right — serum showcase video */}
          <motion.div
            style={{ scale, opacity }}
            className="relative flex justify-center items-center"
          >
            {/* Golden glow behind the frame */}
            <div
              aria-hidden
              className="absolute inset-[-12%] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(247,201,40,0.35) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[520px] aspect-video lg:aspect-[4/5] overflow-hidden rounded-[28px]"
              style={{
                border: '1px solid rgba(199,154,37,0.35)',
                boxShadow: '0 40px 80px rgba(199,154,37,0.28), 0 12px 28px rgba(51,39,25,0.12)',
              }}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src="/video/Animation_showcasing_serum.mp4"
                poster="/video/serum-poster.jpg"
                autoPlay={!reduceMotion}
                controls={!!reduceMotion}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Miss Sunflower Sun Serum close-up showcase"
              />
              {/* Soft inner vignette + caption */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(51,39,25,0) 60%, rgba(51,39,25,0.45) 100%)' }}
              />
              <div
                className="absolute left-5 bottom-5 px-4 py-2 rounded-full pointer-events-none"
                style={{
                  background: 'rgba(255,249,236,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(199,154,37,0.3)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#6B4F1D',
                }}
              >
                SPF 50+ · PA++++
              </div>
            </motion.div>

            {/* Petal resting on the frame corner */}
            <motion.div
              aria-hidden
              animate={{ y: [-8, 8, -8], rotate: [-10, 6, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-2 lg:-right-6 w-16 h-16 lg:w-20 lg:h-20 pointer-events-none"
            >
              <Image src="/images/products/2.png" alt="" fill sizes="80px" className="object-contain" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
