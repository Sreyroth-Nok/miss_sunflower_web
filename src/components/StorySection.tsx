'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const IMG = {
  tube:    '/images/products/4.png',
  head:    '/images/products/flower1.png',
  cluster: '/images/products/flower.png',
  petal:   '/images/products/2.png',
  leaf:    '/images/products/3.png',
};

type Visual = 'field' | 'formula' | 'promise';

const STORY_PANELS: { eyebrow: string; headline: string; body: string; accent: string; visual: Visual; caption: string }[] = [
  {
    eyebrow: 'The Beginning',
    headline: 'Born from\nthe fields of\ngolden blooms.',
    body: 'Miss Sunflower was created with one simple belief: that protection should feel like a ritual, not a chore. Inspired by the resilience and radiance of the sunflower — a flower that always faces the sun.',
    accent: '#F7C928',
    visual: 'field',
    caption: 'Inspired by the sunflower',
  },
  {
    eyebrow: 'The Formula',
    headline: 'Science meets\nthe warmth of\nnature.',
    body: 'Our laboratory team spent three years perfecting a serum-weight formula that delivers SPF 50+ protection with the nourishing power of pure sunflower seed oil. No compromise. No white cast. Only glow.',
    accent: '#E3B341',
    visual: 'formula',
    caption: 'Sunflower seed oil · SPF 50+',
  },
  {
    eyebrow: 'The Promise',
    headline: 'Your skin,\nradiant every\nsingle day.',
    body: 'Miss Sunflower Sun Serum is your daily armor. Light enough to forget you\'re wearing it, powerful enough to protect you from morning to dusk. This is sun care, elevated.',
    accent: '#FFE08A',
    visual: 'promise',
    caption: 'Morning to dusk protection',
  },
];

function PanelVisual({ visual, accent, index }: { visual: Visual; accent: string; index: number }) {
  const float = { duration: 7 + index, repeat: Infinity, ease: 'easeInOut' as const };

  if (visual === 'field') {
    return (
      <>
        <motion.div
          className="absolute"
          style={{ left: '50%', bottom: '-6%', width: '78%', aspectRatio: '1', x: '-50%', transformOrigin: '50% 100%' }}
          animate={{ rotate: [-2, 2, -2] }}
          transition={float}
        >
          <Image src={IMG.cluster} alt="Sunflowers in bloom" fill sizes="400px" className="object-contain"
                 style={{ filter: `drop-shadow(0 24px 40px ${accent}40)` }} />
        </motion.div>
        {[{ l: '14%', t: '18%', s: 46, d: 0 }, { l: '78%', t: '26%', s: 36, d: 1.2 }, { l: '22%', t: '60%', s: 30, d: 2.1 }].map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
            animate={{ y: [-10, 10, -10], rotate: [0, 40, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
          >
            <Image src={IMG.petal} alt="" fill sizes="50px" className="object-contain" />
          </motion.div>
        ))}
      </>
    );
  }

  if (visual === 'formula') {
    return (
      <>
        <motion.div
          className="absolute rounded-full"
          style={{ left: '50%', top: '50%', width: '62%', aspectRatio: '1', x: '-50%', y: '-50%', border: `1px dashed ${accent}55` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute"
          style={{ left: '50%', top: '50%', width: '78%', aspectRatio: '1', x: '-50%', y: '-50%' }}
          animate={{ y: ['-53%', '-47%', '-53%'], rotate: [-4, 2, -4] }}
          transition={float}
        >
          <Image src={IMG.tube} alt="Miss Sunflower Sun Serum SPF 50+" fill sizes="400px" className="object-contain"
                 style={{ filter: `drop-shadow(0 24px 40px ${accent}55)` }} />
        </motion.div>
        <motion.div className="absolute" style={{ left: '10%', top: '14%', width: 70, height: 70 }}
          animate={{ y: [-8, 8, -8], rotate: [-20, -8, -20] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <Image src={IMG.leaf} alt="" fill sizes="70px" className="object-contain" />
        </motion.div>
        {[{ l: '74%', t: '20%', s: 44 }, { l: '70%', t: '66%', s: 34 }, { l: '16%', t: '68%', s: 38 }].map((p, i) => (
          <motion.div key={i} className="absolute" style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
            animate={{ y: [-10, 10, -10], rotate: [0, 50, 0] }}
            transition={{ duration: 5.5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}>
            <Image src={IMG.petal} alt="" fill sizes="50px" className="object-contain" />
          </motion.div>
        ))}
      </>
    );
  }

  // promise — the tube in front of a glowing sunflower "sun"
  return (
    <>
      <motion.div
        className="absolute"
        style={{ left: '50%', top: '42%', width: '62%', aspectRatio: '1', x: '-50%', y: '-50%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <Image src={IMG.head} alt="" fill sizes="320px" className="object-contain"
               style={{ opacity: 0.9, filter: `drop-shadow(0 0 40px ${accent}66)` }} />
      </motion.div>
      <motion.div
        className="absolute"
        style={{ left: '50%', top: '54%', width: '74%', aspectRatio: '1', x: '-50%', y: '-50%' }}
        animate={{ y: ['-53%', '-47%', '-53%'], rotate: [8, 4, 8] }}
        transition={float}
      >
        <Image src={IMG.tube} alt="Miss Sunflower Sun Serum" fill sizes="400px" className="object-contain"
               style={{ filter: 'drop-shadow(0 28px 36px rgba(0,0,0,0.45))' }} />
      </motion.div>
    </>
  );
}

export default function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #4A3820 0%, #332719 60%)' }}
    >
      {/* Ambient background sunflowers */}
      <motion.div
        style={{ y: bgY }}
        className="absolute -top-20 -right-20 w-[520px] h-[520px] opacity-[0.06] pointer-events-none select-none"
      >
        <Image src={IMG.head} alt="" fill sizes="520px" className="object-contain" />
      </motion.div>
      <motion.div
        style={{ y: bgY }}
        className="absolute -bottom-24 -left-24 w-[420px] h-[420px] opacity-[0.05] pointer-events-none select-none"
      >
        <Image src={IMG.head} alt="" fill sizes="420px" className="object-contain" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 lg:mb-28 text-center"
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#F7C928' }}
          >
            Our Story
          </p>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              fontWeight: 600,
              color: '#FFF9EC',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            A love letter to{' '}
            <em style={{ color: '#F7C928' }}>the sun.</em>
          </h2>
          <div className="mx-auto mt-8 h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, #C99A25, transparent)' }} />
        </motion.div>

        {/* Story panels */}
        <div className="space-y-24 lg:space-y-36">
          {STORY_PANELS.map((panel, i) => (
            <motion.div
              key={panel.eyebrow}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              {/* Number + text */}
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-start gap-5 lg:gap-7 mb-8">
                  <span
                    className="text-7xl lg:text-8xl leading-none select-none shrink-0"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 500,
                      color: 'transparent',
                      WebkitTextStroke: `1.2px ${panel.accent}`,
                      opacity: 0.55,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <div className="pt-3 flex-1">
                    <p
                      className="text-xs tracking-[0.25em] uppercase mb-3"
                      style={{ fontFamily: 'DM Sans, sans-serif', color: panel.accent }}
                    >
                      {panel.eyebrow}
                    </p>
                    <h3
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                        fontWeight: 600,
                        color: '#FFF9EC',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {panel.headline}
                    </h3>
                  </div>
                </div>
                <p
                  className="lg:pl-[calc(6rem+1.75rem)]"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.95rem',
                    color: 'rgba(255,249,236,0.72)',
                    lineHeight: 1.8,
                    maxWidth: '46ch',
                  }}
                >
                  {panel.body}
                </p>
              </div>

              {/* Visual card */}
              <div className={`relative flex justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative w-full max-w-[480px] aspect-[4/3] rounded-3xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,249,236,0.07) 0%, rgba(255,249,236,0.02) 100%)',
                    border: `1px solid ${panel.accent}33`,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,249,236,0.06)',
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: `radial-gradient(ellipse 55% 55% at 50% 50%, ${panel.accent}2E 0%, transparent 70%)` }}
                  />
                  <PanelVisual visual={panel.visual} accent={panel.accent} index={i} />
                  <div
                    className="absolute left-5 bottom-5 px-4 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(51,39,25,0.55)',
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${panel.accent}40`,
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.62rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: panel.accent,
                    }}
                  >
                    {panel.caption}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
