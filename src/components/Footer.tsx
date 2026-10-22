'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FOOTER_LINKS = {
  Product: ['Sun Serum SPF 50+', 'How to Use', 'Ingredients', 'Skin Types'],
  Brand: ['Our Story', 'Mission', 'Sustainability', 'Press'],
  Support: ['FAQ', 'Contact Us', 'Shipping Info', 'Returns'],
};

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const SOCIAL = [
  { Icon: IconInstagram, label: 'Instagram', href: '#' },
  { Icon: IconYoutube, label: 'YouTube', href: '#' },
  { Icon: IconMail, label: 'Email', href: '#' },
];

export default function Footer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  // Only play the background video while it is on screen
  // The year is read in the browser: Cache Components forbids reading the clock during prerender
  useEffect(() => {
    if (yearRef.current) yearRef.current.textContent = String(new Date().getFullYear());
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => { });
      else video.pause();
    }, { threshold: 0.1 });
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion]);

  return (
    <footer
      style={{ background: '#1a1008', color: '#FFF9EC' }}
      className="relative overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, #C99A25, transparent)' }}
      />

      {/* Hero footer banner — sunflower-field video background */}
      <div
        className="relative flex items-center py-24 lg:py-32 overflow-hidden border-b border-[#C99A25]/10"
        style={{ minHeight: 'min(88svh, 820px)' }}
      >
        <video
          ref={videoRef}
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src="/video/Serum_bottle.mp4"
          poster="/video/serum-bottle-poster.jpg"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* Warm dark wash for legibility, fading into the footer below */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(26,16,8,0.55) 0%, rgba(26,16,8,0.25) 70%),' +
              'linear-gradient(180deg, rgba(26,16,8,0.7) 0%, rgba(26,16,8,0.2) 35%, rgba(26,16,8,0.35) 70%, #1a1008 100%)',
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-xs tracking-[0.3em] uppercase mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#F7C928', textShadow: '0 1px 12px rgba(26,16,8,0.6)' }}
          >
            Your Daily Ritual
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(3rem, 9vw, 7.5rem)',
              fontWeight: 600,
              color: '#FFF9EC',
              letterSpacing: '-0.02em',
              lineHeight: 1.0,
              textShadow: '0 4px 40px rgba(26,16,8,0.55)',
            }}
          >
            Glow every
            <br />
            <em style={{ color: '#F7C928' }}>single day.</em>
          </motion.h2>

          {/* SPF badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 inline-flex items-center gap-3 px-6 py-2 rounded-full"
            style={{
              border: '1px solid rgba(247,201,40,0.45)',
              background: 'rgba(26,16,8,0.45)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.72rem',
                color: '#F7C928',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Miss Sunflower · Sun Serum · SPF 50+ PA++++
            </span>
          </motion.div>
        </div>
      </div>

      {/* Links + Social */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div>
            <div className="mb-6">
              <span
                className="block text-2xl font-normal italic"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FFF9EC' }}
              >
                Miss
              </span>
              <span
                className="block text-sm font-semibold tracking-widest uppercase"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: '#C99A25', marginTop: '-4px' }}
              >
                Sunflower
              </span>
            </div>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.8rem',
                color: 'rgba(255,249,236,0.5)',
                lineHeight: 1.8,
              }}
            >
              A sun-care ritual born from
              the radiance of the sunflower.
              Protect, nourish, glow.
            </p>

            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              {SOCIAL.map(({ Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15, color: '#F7C928' }}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    border: '1px solid rgba(199,154,37,0.3)',
                    color: 'rgba(255,249,236,0.6)',
                  }}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3
                className="mb-5 text-xs tracking-[0.25em] uppercase"
                style={{ fontFamily: 'DM Sans, sans-serif', color: '#C99A25' }}
              >
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="hover:text-[#F7C928] transition-colors duration-200"
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.82rem',
                        color: 'rgba(255,249,236,0.55)',
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(199,154,37,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.72rem',
              color: 'rgba(255,249,236,0.35)',
              letterSpacing: '0.05em',
            }}
          >
            © <span ref={yearRef} /> Miss Sunflower. All rights reserved.
          </p>

          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.72rem',
              color: 'rgba(255, 254, 251, 0.96)',
              letterSpacing: '0.05em',
            }}
          >
            Developed by Zzzroth lvu
          </p>
        </div>
      </div>
    </footer>
  );
}
