'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

// ─── Assets (all transparent PNGs in /public/images/products) ───────────────
const IMG = {
  tube:  '/images/products/4.png',
  head:  '/images/products/flower1.png',
  petal: '/images/products/2.png',
  leaf:  '/images/products/3.png',
};

// Stage geometry (all relative to --h, the stage height)
const STAGE_H   = 'clamp(440px, 50vw, 760px)';
const TABLE_Y   = 0.76;   // table line, fraction of stage height
const TUBE_BOX  = 0.62;   // square image box, fraction of stage height
const TUBE_FOOT = 391 / 432;  // tube base inside 4.png (transparent padding below)
const TUBES_PER_SET = 6;
const SPACING = 'clamp(220px, 25vw, 360px)';
const spacingPx = (vw: number) => Math.max(220, Math.min(360, vw * 0.25));

// ─── Table props — travel with the tubes (x in units of SPACING) ────────────
const TABLE_HEADS = [
  { x: 1.0, size: 0.30, rot: -18 },
  { x: 4.05, size: 0.24, rot: 22 },
];
const TABLE_PETALS = [
  { x: 0.28, rot: -30, s: 0.08 }, { x: 1.78, rot: 15, s: 0.07 }, { x: 2.22, rot: -60, s: 0.09 },
  { x: 2.62, rot: 40, s: 0.065 }, { x: 3.12, rot: -10, s: 0.08 }, { x: 3.62, rot: 70, s: 0.07 },
  { x: 4.62, rot: -45, s: 0.085 }, { x: 5.38, rot: 25, s: 0.075 }, { x: 5.82, rot: -75, s: 0.07 },
];
const TABLE_LEAVES = [
  { x: 0.82, rot: -120, s: 0.11 },
  { x: 4.3, rot: 60, s: 0.1 },
];

// ─── Floating petals & leaves at three depths ───────────────────────────────
// x0/y: start position (fraction of W / stage H) · size: fraction of stage H
// sf: horizontal speed as a multiple of the track speed (parallax)
// z: 'back' (behind tubes) | 'mid' | 'front' (in front, soft focus)
type Depth = 'back' | 'mid' | 'front';
const FLOATERS: { img: string; x0: number; y: number; size: number; sf: number; z: Depth; flip: number; ph: number }[] = [
  { img: IMG.head,  x0: 0.38, y: 0.06, size: 0.24, sf: 0.25, z: 'back',  flip: 0,   ph: 0.0 },
  { img: IMG.petal, x0: 0.10, y: 0.18, size: 0.09, sf: 0.45, z: 'back',  flip: 40,  ph: 1.1 },
  { img: IMG.petal, x0: 0.62, y: 0.12, size: 0.08, sf: 0.55, z: 'back',  flip: 55,  ph: 2.3 },
  { img: IMG.leaf,  x0: 0.85, y: 0.36, size: 0.10, sf: 0.40, z: 'back',  flip: 25,  ph: 3.0 },
  { img: IMG.petal, x0: 0.33, y: 0.52, size: 0.07, sf: 0.50, z: 'back',  flip: 70,  ph: 4.2 },
  { img: IMG.leaf,  x0: 0.05, y: 0.24, size: 0.11, sf: 0.35, z: 'back',  flip: 20,  ph: 5.1 },
  { img: IMG.petal, x0: 0.25, y: 0.30, size: 0.13, sf: 1.30, z: 'mid',   flip: 60,  ph: 0.7 },
  { img: IMG.petal, x0: 0.70, y: 0.40, size: 0.11, sf: 1.20, z: 'mid',   flip: 80,  ph: 1.9 },
  { img: IMG.leaf,  x0: 0.64, y: 0.08, size: 0.13, sf: 1.10, z: 'mid',   flip: 30,  ph: 2.8 },
  { img: IMG.petal, x0: 0.80, y: 0.14, size: 0.12, sf: 1.40, z: 'mid',   flip: 65,  ph: 3.7 },
  { img: IMG.petal, x0: 0.45, y: 0.62, size: 0.10, sf: 1.25, z: 'mid',   flip: 90,  ph: 4.9 },
  { img: IMG.petal, x0: 0.92, y: 0.58, size: 0.09, sf: 1.35, z: 'mid',   flip: 75,  ph: 5.6 },
  { img: IMG.petal, x0: 0.15, y: 0.46, size: 0.17, sf: 2.10, z: 'front', flip: 45,  ph: 0.4 },
  { img: IMG.petal, x0: 0.58, y: 0.78, size: 0.15, sf: 2.40, z: 'front', flip: 55,  ph: 2.6 },
  { img: IMG.leaf,  x0: 0.88, y: 0.70, size: 0.18, sf: 1.90, z: 'front', flip: 22,  ph: 4.4 },
];
const DEPTH_STYLE: Record<Depth, { z: number; blur: number; op: number }> = {
  back:  { z: 2,  blur: 1.6, op: 0.6 },
  mid:   { z: 12, blur: 0,   op: 0.95 },
  front: { z: 30, blur: 3,   op: 0.9 },
};

const TRACK_SPEED = 55;   // px/s — steady horizontal pan
const GLOW_SPEED  = 0.12; // background type drifts at a fraction of the track speed

export default function ProductMarquee() {
  const reduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef   = useRef<HTMLDivElement | null>(null);
  const trackRef   = useRef<HTMLDivElement | null>(null);
  const glowRowRef = useRef<HTMLDivElement | null>(null);
  const beamsRef   = useRef<HTMLDivElement | null>(null);
  const floatRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let W = stage.clientWidth;
    let H = stage.clientHeight;
    let glowUnit = glowRowRef.current?.firstElementChild instanceof HTMLElement
      ? glowRowRef.current.firstElementChild.offsetWidth : 0;
    const ro = new ResizeObserver(() => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      const first = glowRowRef.current?.firstElementChild;
      glowUnit = first instanceof HTMLElement ? first.offsetWidth : 0;
    });
    ro.observe(stage);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(stage);

    let raf = 0;
    let t0 = 0;

    const render = (t: number) => {
      const travel = t * TRACK_SPEED;

      // Product track — two identical sets, wrapped for a seamless loop
      if (trackRef.current) {
        const setW = spacingPx(window.innerWidth) * TUBES_PER_SET;
        trackRef.current.style.transform = `translate3d(${(-(travel % setW)).toFixed(2)}px, 0, 0)`;
      }

      // Background "GLOW" — slow, deep parallax drift
      if (glowRowRef.current && glowUnit) {
        glowRowRef.current.style.transform =
          `translate3d(${(-((travel * GLOW_SPEED) % glowUnit)).toFixed(2)}px, 0, 0)`;
      }

      if (beamsRef.current) {
        beamsRef.current.style.opacity = (0.75 + Math.sin(t * 0.35) * 0.2).toFixed(3);
      }

      // Floating petals — horizontal drift at depth-dependent speed, gentle bob, 3D tumble
      FLOATERS.forEach((f, i) => {
        const el = floatRefs.current[i];
        if (!el) return;
        const size = f.size * H;
        const span = W + size * 2;
        const x = ((((f.x0 * span - travel * f.sf) % span) + span) % span) - size;
        const y = f.y * H + Math.sin(t * 0.6 + f.ph) * H * 0.025;
        const rz = f.flip ? Math.sin(t * 0.4 + f.ph) * 35 + f.ph * 60 : t * 4;
        const ry = f.flip ? t * f.flip + f.ph * 50 : 0;
        const rx = f.flip ? Math.sin(t * 0.7 + f.ph) * 30 : 0;
        el.style.width = el.style.height = `${size.toFixed(0)}px`;
        el.style.transform =
          `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) perspective(500px) ` +
          `rotateZ(${rz.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg)`;
      });
    };

    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      if (visible) render((ts - t0) * 0.001);
      raf = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      render(0);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduceMotion]);

  const node: React.CSSProperties = { position: 'absolute', left: 0, top: 0, willChange: 'transform' };

  // One set of tubes + table props; rendered twice for the loop
  const renderSet = (set: number) => (
    <div
      key={set}
      style={{
        position: 'absolute', top: 0, height: '100%',
        left: `calc(${set} * ${TUBES_PER_SET} * ${SPACING})`,
        width: `calc(${TUBES_PER_SET} * ${SPACING})`,
      }}
    >
      {/* Table props behind the tubes */}
      {TABLE_HEADS.map((h, i) => (
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: `calc(${h.x} * ${SPACING} - var(--h) * ${h.size / 2})`,
            top: `calc(var(--h) * ${TABLE_Y - h.size * 0.78})`,
            width: `calc(var(--h) * ${h.size})`,
            height: `calc(var(--h) * ${h.size})`,
            transform: `perspective(600px) rotateX(38deg) rotate(${h.rot}deg)`,
            filter: 'drop-shadow(0 14px 12px rgba(150,100,20,0.28))',
            zIndex: 8,
          }}
        >
          <Image src={IMG.head} alt="" fill sizes="240px" className="object-contain" />
        </div>
      ))}
      {TABLE_LEAVES.map((l, i) => (
        <div
          key={`l${i}`}
          style={{
            position: 'absolute',
            left: `calc(${l.x} * ${SPACING} - var(--h) * ${l.s / 2})`,
            top: `calc(var(--h) * ${TABLE_Y + 0.04 - l.s / 2})`,
            width: `calc(var(--h) * ${l.s})`,
            height: `calc(var(--h) * ${l.s})`,
            transform: `scaleY(0.5) rotate(${l.rot}deg)`,
            filter: 'drop-shadow(0 6px 4px rgba(150,100,20,0.25))',
            zIndex: 7,
          }}
        >
          <Image src={IMG.leaf} alt="" fill sizes="100px" className="object-contain" />
        </div>
      ))}

      {/* Tubes */}
      {Array.from({ length: TUBES_PER_SET }, (_, i) => (
        <div key={`t${i}`}>
          {/* Cast shadow, falling back-right from the low golden light */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${i + 0.5} * ${SPACING} - var(--h) * 0.06)`,
              top: `calc(var(--h) * ${TABLE_Y - 0.03})`,
              width: `calc(var(--h) * 0.34)`,
              height: `calc(var(--h) * 0.05)`,
              transform: 'skewX(-55deg)',
              transformOrigin: '0 100%',
              background: 'linear-gradient(90deg, rgba(120,84,20,0.32), rgba(120,84,20,0))',
              borderRadius: '40%',
              filter: 'blur(6px)',
              zIndex: 9,
            }}
          />
          {/* Contact shadow */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${i + 0.5} * ${SPACING} - var(--h) * 0.12)`,
              top: `calc(var(--h) * ${TABLE_Y - 0.015})`,
              width: `calc(var(--h) * 0.24)`,
              height: `calc(var(--h) * 0.03)`,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(110,76,16,0.45) 0%, transparent 70%)',
              filter: 'blur(3px)',
              zIndex: 9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `calc(${i + 0.5} * ${SPACING} - var(--h) * ${TUBE_BOX / 2})`,
              top: `calc(var(--h) * ${TABLE_Y - TUBE_BOX * TUBE_FOOT})`,
              width: `calc(var(--h) * ${TUBE_BOX})`,
              height: `calc(var(--h) * ${TUBE_BOX})`,
              zIndex: 10,
            }}
          >
            <Image
              src={IMG.tube}
              alt={set === 0 && i === 0 ? 'Miss Sunflower Sun Serum SPF 50+ PA++++' : ''}
              fill
              sizes="480px"
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      ))}

      {/* Petals resting on the table, in front of the tubes */}
      {TABLE_PETALS.map((p, i) => (
        <div
          key={`p${i}`}
          style={{
            position: 'absolute',
            left: `calc(${p.x} * ${SPACING} - var(--h) * ${p.s / 2})`,
            top: `calc(var(--h) * ${TABLE_Y + 0.025 + (i % 3) * 0.035 - p.s / 2})`,
            width: `calc(var(--h) * ${p.s})`,
            height: `calc(var(--h) * ${p.s})`,
            transform: `scaleY(0.55) rotate(${p.rot}deg)`,
            filter: 'drop-shadow(0 5px 3px rgba(150,100,20,0.28))',
            zIndex: 11,
          }}
        >
          <Image src={IMG.petal} alt="" fill sizes="80px" className="object-contain" />
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: '#FFF9EC', ['--h' as string]: STAGE_H }}
    >
      {/* ── Section title ─────────────────────────────────────────────── */}
      <div
        className="relative px-6 pt-20 pb-12 lg:pt-28 lg:pb-16 text-center"
        style={{ background: 'linear-gradient(180deg, #FFF9EC 0%, #FBF0D8 55%, #F6E3BC 100%)' }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-xs tracking-[0.3em] uppercase mb-4"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#C99A25' }}
        >
          Our Product
        </motion.p>
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.6rem, 6vw, 5rem)',
            fontWeight: 600,
            color: '#332719',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {['Miss Sunflower', 'Sun Serum'].map((line, i) => (
            <span key={line} className="block overflow-hidden" style={{ paddingBottom: '0.06em' }}>
              <motion.span
                className="inline-block"
                initial={{ y: '105%', opacity: 0 }}
                whileInView={{ y: '0%', opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={i ? { color: '#C99A25', fontStyle: 'italic' } : undefined}
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
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mx-auto mt-6 h-px w-24"
          style={{ background: 'linear-gradient(90deg, transparent, #C99A25, transparent)' }}
        />
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mx-auto mt-6"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
            lineHeight: 1.75,
            color: '#5A4530',
            maxWidth: '46ch',
          }}
        >
          SPF 50+ PA++++ in a featherlight serum — protection, hydration and a golden glow in one daily step.
        </motion.p>
      </div>

      {/* ── Stage ─────────────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden"
        style={{
          height: 'var(--h)',
          background: 'linear-gradient(180deg, #F6E3BC 0%, #FAEBCB 45%, #F7E2B6 76%, #FBEFD6 76.2%, #FFF6E4 100%)',
        }}
      >
        {/* Warm golden light from the top-left */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background:
              'radial-gradient(ellipse 60% 70% at 18% 10%, rgba(255,240,200,0.85), transparent 70%),' +
              'radial-gradient(ellipse 50% 40% at 85% 85%, rgba(247,201,40,0.12), transparent 70%)',
          }}
        />
        <div
          ref={beamsRef}
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: '-20%',
            zIndex: 1,
            background:
              'repeating-linear-gradient(118deg, rgba(255,250,230,0) 0px, rgba(255,250,230,0) 90px, rgba(255,248,225,0.6) 140px, rgba(255,250,230,0) 200px, rgba(255,250,230,0) 320px)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 25% 20%, #000 0%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse 70% 80% at 25% 20%, #000 0%, transparent 75%)',
            filter: 'blur(14px)',
          }}
        />

        {/* Oversized low-opacity "GLOW" */}
        <div aria-hidden className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 1 }}>
          <div
            ref={glowRowRef}
            className="absolute flex whitespace-nowrap"
            style={{ left: 0, top: '50%', transform: 'translate3d(0,0,0)', marginTop: '-0.58em', fontSize: 'calc(var(--h) * 0.62)', willChange: 'transform' }}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 500,
                  lineHeight: 1,
                  paddingRight: '0.45em',
                  color: 'rgba(201,154,37,0.12)',
                }}
              >
                GLOW
              </span>
            ))}
          </div>
        </div>

        {/* Floating petals (z-index per depth: behind, between and in front of the tubes) */}
        {FLOATERS.map((f, i) => {
          const d = DEPTH_STYLE[f.z];
          return (
            <div
              key={`f${i}`}
              ref={el => { floatRefs.current[i] = el; }}
              aria-hidden
              className="pointer-events-none"
              style={{
                ...node,
                width: 60,
                height: 60,
                zIndex: d.z,
                opacity: d.op,
                filter: `${d.blur ? `blur(${d.blur}px) ` : ''}drop-shadow(0 10px 12px rgba(150,100,20,0.2))`,
              }}
            >
              <Image src={f.img} alt="" fill sizes="160px" className="object-contain" />
            </div>
          );
        })}

        {/* Product track */}
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <div ref={trackRef} className="absolute inset-0" style={{ willChange: 'transform' }}>
            {renderSet(0)}
            {renderSet(1)}
          </div>
        </div>

        {/* Soft edge vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 40,
            background:
              'linear-gradient(90deg, rgba(246,227,188,0.55) 0%, rgba(246,227,188,0) 10%, rgba(246,227,188,0) 90%, rgba(246,227,188,0.55) 100%)',
          }}
        />
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex items-center justify-center gap-6 sm:gap-8 px-6 py-6"
      >
        <div className="text-center sm:text-right">
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 500,
              lineHeight: 1,
              color: '#B88A2A',
            }}
          >
            SPF 50+
          </p>
          <p
            style={{
              marginTop: 6,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(0.8rem, 1.3vw, 1.05rem)',
              color: '#332719',
            }}
          >
            UVA/UVB Protection
          </p>
        </div>
        <span aria-hidden style={{ width: 1, alignSelf: 'stretch', background: 'rgba(51,39,25,0.25)' }} />
        <a
          href="#product-detail"
          onClick={e => {
            e.preventDefault();
            document.querySelector('#product-detail')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="transition-transform duration-300 hover:scale-105"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 'clamp(10px, 1.2vw, 14px) clamp(26px, 3vw, 40px)',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #D9B45A 0%, #B88A2A 100%)',
            boxShadow: '0 8px 22px rgba(184,138,42,0.3)',
            color: '#FFFFFF',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.25rem)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Shop Now
        </a>
      </motion.div>
    </section>
  );
}
