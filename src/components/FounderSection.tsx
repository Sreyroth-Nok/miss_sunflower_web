'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { scrollToSection } from '@/lib/scroll';

const FOUNDER_NAME = 'Lai Souyiek';

const IMG = {
  portrait: '/images/founder1.jpg',
  launch:   '/images/founder.jpg',
  petal:    '/images/products/2.png',
};

const BODY = [
  'Miss Sunflower began with a simple wish — sun care that feels as joyful as standing in a field of sunflowers at golden hour.',
  'I wanted a serum light enough to wear every single day, gentle enough for every skin, and beautiful enough to look forward to. Every bottle carries that promise: protect your skin, honour your glow, and face the sun with confidence.',
];

const EASE = [0.22, 1, 0.36, 1] as const;

// Petals drifting around the portrait at different depths.
// x/y: position in the portrait column (%), size px, depth: scroll parallax strength (front > 0, back < 0)
const PETALS = [
  { x: '-6%',  y: '12%', size: 54, depth:  1.0, rot: -30, front: true,  dur: 7 },
  { x: '88%',  y: '6%',  size: 40, depth: -0.6, rot:  40, front: false, dur: 8 },
  { x: '96%',  y: '46%', size: 62, depth:  1.4, rot:  15, front: true,  dur: 6.5 },
  { x: '-10%', y: '62%', size: 36, depth: -0.8, rot: -60, front: false, dur: 9 },
  { x: '78%',  y: '88%', size: 46, depth:  0.9, rot:  70, front: true,  dur: 7.5 },
  { x: '18%',  y: '-4%', size: 30, depth: -0.5, rot:  20, front: false, dur: 8.5 },
];

function Petal({ p, progress, still }: { p: (typeof PETALS)[number]; progress: MotionValue<number>; still: boolean }) {
  const y = useTransform(progress, [0, 1], [90 * p.depth, -90 * p.depth]);
  return (
    <motion.div
      aria-hidden
      className="absolute pointer-events-none"
      style={{ left: p.x, top: p.y, width: p.size, height: p.size, y, zIndex: p.front ? 30 : 1 }}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: p.front ? 0.95 : 0.7, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, delay: 0.6, ease: EASE }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ filter: p.front ? 'drop-shadow(0 10px 12px rgba(150,100,20,0.25))' : 'blur(1.5px)' }}
        animate={still ? undefined : { rotate: [p.rot, p.rot + 35, p.rot], y: [-8, 8, -8], rotateY: [0, 180, 360] }}
        transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src={IMG.petal} alt="" fill sizes="64px" className="object-contain" />
      </motion.div>
    </motion.div>
  );
}

export default function FounderSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const glowY     = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const insetY    = useTransform(scrollYProgress, [0, 1], [80, -40]);

  const reveal = (delay: number, y = 24) => ({
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section
      id="founder"
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-36"
      style={{ background: 'linear-gradient(180deg, #FFFBF0 0%, #FFF9EC 50%, #FFF4DC 100%)' }}
    >
      {/* Soft golden-hour light from the right */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 65% at 78% 45%, rgba(247,201,40,0.14), transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-20 items-center">
          {/* ── Left: narrative ─────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            <motion.p
              {...reveal(0, 16)}
              className="text-xs tracking-[0.3em] uppercase mb-6"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#C99A25' }}
            >
              The Person Behind the Brand
            </motion.p>

            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2.8rem, 6vw, 5.2rem)',
                fontWeight: 600,
                color: '#332719',
                letterSpacing: '-0.02em',
                lineHeight: 1.04,
              }}
            >
              {['Every Brand', 'Has a Story.'].map((line, i) => (
                <span key={line} className="block overflow-hidden" style={{ paddingBottom: '0.06em' }}>
                  <motion.span
                    className="inline-block"
                    initial={{ y: '105%' }}
                    whileInView={{ y: '0%' }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: EASE }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h2>

            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: 0.4, ease: EASE }}
              className="mt-8 h-px w-24 origin-left"
              style={{ background: 'linear-gradient(90deg, #C99A25, transparent)' }}
            />

            <motion.h3
              {...reveal(0.55)}
              className="mt-8"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 500,
                fontStyle: 'italic',
                color: '#C99A25',
                lineHeight: 1.15,
              }}
            >
              Ours Begins With a Vision.
            </motion.h3>

            {BODY.map((para, i) => (
              <motion.p
                key={i}
                {...reveal(0.7 + i * 0.15, 18)}
                className="mt-5"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 'clamp(0.92rem, 1.15vw, 1.02rem)',
                  lineHeight: 1.85,
                  color: '#5A4530',
                  maxWidth: '48ch',
                }}
              >
                {para}
              </motion.p>
            ))}

            <motion.div {...reveal(1.0, 12)} className="mt-7">
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontStyle: 'italic', fontWeight: 500, color: '#332719', lineHeight: 1.1 }}>
                — {FOUNDER_NAME}
              </p>
              <p
                className="mt-1.5"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.66rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C99A25' }}
              >
                Founder, Miss Sunflower
              </p>
            </motion.div>

            <motion.a
              {...reveal(1.15, 12)}
              href="#story"
              onClick={e => { e.preventDefault(); scrollToSection('#story'); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group mt-10 inline-flex items-center gap-3 px-9 py-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #D9B45A 0%, #B88A2A 100%)',
                boxShadow: '0 10px 28px rgba(184,138,42,0.32)',
                color: '#FFFFFF',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Discover My Story
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </motion.a>
          </div>

          {/* ── Right: editorial portrait ───────────────────────────────── */}
          <div className="order-1 lg:order-2 relative mx-auto w-full max-w-[460px]">
            {/* Champagne-gold circular glow */}
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
              style={{
                width: '118%', aspectRatio: '1', x: '-50%', y: glowY, translateY: '-50%',
                background: 'radial-gradient(circle, rgba(247,214,120,0.55) 0%, rgba(232,196,110,0.28) 42%, rgba(232,196,110,0) 70%)',
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.6, ease: EASE }}
            />
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
              style={{ width: '96%', aspectRatio: '1', x: '-50%', y: '-50%', border: '1px solid rgba(201,154,37,0.35)' }}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
            />

            {/* Back petals */}
            {PETALS.filter(p => !p.front).map((p, i) => (
              <Petal key={`b${i}`} p={p} progress={scrollYProgress} still={reduceMotion} />
            ))}

            {/* Portrait in an arched frame */}
            <motion.div
              className="relative z-10"
              style={{ y: portraitY }}
              initial={{ opacity: 0, y: 60, clipPath: 'inset(100% 0% 0% 0% round 999px 999px 28px 28px)' }}
              whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 999px 999px 28px 28px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, delay: 0.25, ease: EASE }}
            >
              <div
                className="relative w-full aspect-[4/5] overflow-hidden"
                style={{
                  borderRadius: '999px 999px 28px 28px',
                  border: '1px solid rgba(201,154,37,0.4)',
                  boxShadow: '0 40px 80px rgba(160,110,20,0.25), 0 12px 24px rgba(51,39,25,0.1)',
                }}
              >
                <Image
                  src={IMG.portrait}
                  alt={`${FOUNDER_NAME}, founder of Miss Sunflower, wearing a sunflower crown`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 460px"
                  quality={90}
                  className="object-cover"
                  style={{ objectPosition: '50% 30%' }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(255,249,236,0) 65%, rgba(51,39,25,0.25) 100%)' }}
                />
              </div>
            </motion.div>

            {/* Inset: at the launch */}
            <motion.div
              className="absolute z-20 -left-4 sm:-left-10 bottom-[8%] w-[34%] max-w-[160px]"
              style={{ y: insetY }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
            >
              <div
                className="relative w-full aspect-square rounded-full overflow-hidden"
                style={{ border: '4px solid #FFF9EC', boxShadow: '0 18px 36px rgba(51,39,25,0.22)' }}
              >
                <Image src={IMG.launch} alt={`${FOUNDER_NAME} presenting Miss Sunflower at the launch`} fill sizes="160px" className="object-cover" />
              </div>
              <p
                className="mt-3 text-center"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A6526' }}
              >
                The Launch
              </p>
            </motion.div>

            {/* Front petals */}
            {PETALS.filter(p => p.front).map((p, i) => (
              <Petal key={`f${i}`} p={p} progress={scrollYProgress} still={reduceMotion} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
