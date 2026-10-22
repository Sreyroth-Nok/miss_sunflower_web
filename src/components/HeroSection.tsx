'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

// ─── Assets (all transparent PNGs in /public/images/products) ───────────────
const IMG = {
  tube:    '/images/products/4.png',       // yellow Sun Serum tube
  head:    '/images/products/flower1.png', // sunflower head
  cluster: '/images/products/flower.png',  // sunflowers on stem
  petal:   '/images/products/2.png',       // loose petal
  leaf:    '/images/products/3.png',       // leaf
};

const TAU = Math.PI * 2;

// Deterministic PRNG so server and client render identical markup
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Sunflower heads — swing along an orbital arc around the product ────────
// base: angle on the orbit (rad) · amp: arc swing (rad) · period: arc loop (s)
// rx/ry: orbit radii as fraction of hero W/H · size: px at 1440w
// spin: bloom self-rotation deg/s · loop: small local loop radius px · depth: parallax
// tilt: max 3D tilt (deg) · leaves: tucked behind the bloom { x, y offset / size, rot deg, s scale }
const HEADS = [
  { base: -2.55, amp: 0.10, period: 26, rx: 0.36, ry: 0.36, size: 150, spin:  5, loop: 14, depth: 0.55, blur: 0, tilt: 22,
    leaves: [{ x: -0.42, y: -0.18, rot: -140, s: 0.85 }, { x: -0.3, y: 0.32, rot: 160, s: 0.7 }] },
  { base: -0.62, amp: 0.08, period: 32, rx: 0.33, ry: 0.50, size: 175, spin: -4, loop: 18, depth: 0.70, blur: 0, tilt: 18,
    leaves: [] },
  { base:  2.42, amp: 0.07, period: 29, rx: 0.48, ry: 0.56, size: 280, spin:  3, loop: 16, depth: 1.25, blur: 3, tilt: 14,
    leaves: [{ x: 0.45, y: 0.3, rot: 40, s: 0.6 }] },
  { base:  0.48, amp: 0.09, period: 23, rx: 0.40, ry: 0.42, size: 190, spin: -5, loop: 20, depth: 1.05, blur: 0, tilt: 20,
    leaves: [{ x: -0.48, y: 0.1, rot: -100, s: 0.75 }] },
  { base:  0.05, amp: 0.11, period: 35, rx: 0.47, ry: 0.30, size: 120, spin:  6, loop: 12, depth: 0.85, blur: 0, tilt: 24,
    leaves: [{ x: 0.1, y: -0.48, rot: -20, s: 0.7 }] },
];

// ─── Petals & leaves — full 3D orbits on tilted ellipses around the tube ────
// r: orbit radius (fraction of W) · tilt: vertical squash · dy: orbit height offset (fraction of H)
// period: s per orbit · dir: ±1 · flip: 3D tumble deg/s
const FLYERS = [
  { img: IMG.petal, size: 62, r: 0.22, tilt: 0.42, dy: -0.04, period: 24, dir:  1, phase: 0.3, flip: 70 },
  { img: IMG.petal, size: 44, r: 0.27, tilt: 0.38, dy:  0.06, period: 31, dir:  1, phase: 2.4, flip: 55 },
  { img: IMG.petal, size: 54, r: 0.31, tilt: 0.46, dy: -0.10, period: 28, dir: -1, phase: 4.1, flip: 80 },
  { img: IMG.petal, size: 38, r: 0.19, tilt: 0.50, dy:  0.10, period: 20, dir: -1, phase: 1.2, flip: 95 },
  { img: IMG.petal, size: 58, r: 0.35, tilt: 0.34, dy:  0.02, period: 36, dir:  1, phase: 5.2, flip: 60 },
  { img: IMG.petal, size: 34, r: 0.25, tilt: 0.44, dy: -0.16, period: 22, dir:  1, phase: 3.3, flip: 85 },
  { img: IMG.petal, size: 48, r: 0.29, tilt: 0.40, dy:  0.14, period: 33, dir: -1, phase: 0.9, flip: 65 },
  { img: IMG.petal, size: 52, r: 0.41, tilt: 0.30, dy: -0.20, period: 39, dir: -1, phase: 3.9, flip: 50 },
  { img: IMG.leaf,  size: 82, r: 0.38, tilt: 0.36, dy:  0.08, period: 42, dir: -1, phase: 2.0, flip: 30 },
  { img: IMG.leaf,  size: 66, r: 0.33, tilt: 0.40, dy: -0.12, period: 46, dir:  1, phase: 4.6, flip: 26 },
  { img: IMG.leaf,  size: 74, r: 0.44, tilt: 0.32, dy:  0.18, period: 51, dir:  1, phase: 0.6, flip: 22 },
];

// ─── Golden particles — two depth layers drifting at different speeds ───────
const rand = mulberry32(20261022);
const makeParticles = (n: number, sMin: number, sMax: number, vMin: number, vMax: number) =>
  Array.from({ length: n }, () => ({
    x: rand(), y: rand(),
    s: sMin + rand() * (sMax - sMin),
    v: vMin + rand() * (vMax - vMin),   // upward drift px/s
    w: 0.2 + rand() * 0.5,              // sway frequency
    a: 8 + rand() * 22,                 // sway amplitude px
    ph: rand() * TAU,
    tw: 0.6 + rand() * 1.6,             // shimmer speed
  }));
const FAR_PARTICLES  = makeParticles(34, 1.5, 3, 5, 12);
const NEAR_PARTICLES = makeParticles(14, 3.5, 6.5, 16, 30);

// Parallax strength per layer: mouse (fraction of offset), scroll (fraction of scrollY)
const PX = {
  text: { m: -0.025, s: 0.45 },
  far:  { m: -0.012, s: 0.30 },
  near: { m:  0.035, s: 0.08 },
  tube: { m:  0.012, s: -0.12 },
};

const BOTTLE_Z = 20;

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  const sectionRef   = useRef<HTMLElement | null>(null);
  const textRef      = useRef<HTMLDivElement | null>(null);
  const tubeRef      = useRef<HTMLDivElement | null>(null);
  const shadowRef    = useRef<HTMLDivElement | null>(null);
  const glowRef      = useRef<HTMLDivElement | null>(null);
  const raysRef      = useRef<HTMLDivElement | null>(null);
  const clusterRef   = useRef<HTMLDivElement | null>(null);
  const headRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const headSpinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flyerRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const farRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const nearRefs     = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let W = section.clientWidth;
    let H = section.clientHeight;
    let sc = 1;

    // Element sizes only change with the viewport — set them on resize, never per frame
    const applySizes = () => {
      sc = Math.max(0.55, Math.min(1.15, W / 1440));
      HEADS.forEach((h, i) => {
        const el = headRefs.current[i];
        if (el) el.style.width = el.style.height = `${(h.size * sc).toFixed(0)}px`;
      });
      FLYERS.forEach((f, i) => {
        const el = flyerRefs.current[i];
        if (el) el.style.width = el.style.height = `${(f.size * sc * 1.3).toFixed(0)}px`;
      });
    };
    applySizes();
    const ro = new ResizeObserver(() => {
      W = section.clientWidth;
      H = section.clientHeight;
      applySizes();
    });
    ro.observe(section);

    // Last written z-index / blur per flyer, so they are only touched when they change
    const lastZ: number[] = [];
    const lastBlur: number[] = [];

    // Mouse target + smoothed value (lerp inside RAF)
    let tx = 0, ty = 0, mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX - window.innerWidth / 2;
      ty = e.clientY - window.innerHeight / 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Pause the loop while the hero is off-screen
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(section);

    let raf = 0;
    let t0 = 0;

    const render = (t: number) => {
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      const sy = window.scrollY;
      const cx = W * 0.5;
      const cy = H * 0.45;

      // Background typography — slowest, deepest layer
      if (textRef.current) {
        const drift = Math.sin(t * 0.05) * W * 0.012;
        textRef.current.style.transform =
          `translate3d(${(drift + mx * PX.text.m).toFixed(1)}px, ${(my * PX.text.m + sy * PX.text.s).toFixed(1)}px, 0)`;
      }

      // Particles
      const drawParticles = (
        list: typeof FAR_PARTICLES,
        refs: (HTMLDivElement | null)[],
        p: { m: number; s: number },
        maxOp: number,
      ) => {
        const span = H + 40;
        list.forEach((pt, i) => {
          const el = refs[i];
          if (!el) return;
          const y = ((((pt.y * span - t * pt.v) % span) + span) % span) - 20;
          const x = pt.x * W + Math.sin(t * pt.w + pt.ph) * pt.a;
          const op = maxOp * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * pt.tw + pt.ph)));
          el.style.opacity = op.toFixed(3);
          el.style.transform =
            `translate3d(${(x + mx * p.m).toFixed(1)}px, ${(y + my * p.m + sy * p.s).toFixed(1)}px, 0)`;
        });
      };
      drawParticles(FAR_PARTICLES, farRefs.current, PX.far, 0.6);
      drawParticles(NEAR_PARTICLES, nearRefs.current, PX.near, 0.9);

      // Golden light behind the tube
      if (glowRef.current) {
        const pulse = 1 + Math.sin(t * 0.6) * 0.08;
        glowRef.current.style.opacity = (0.75 + Math.sin(t * 0.9) * 0.2).toFixed(3);
        glowRef.current.style.transform = `translate(-50%, -50%) scale(${pulse.toFixed(3)})`;
      }
      if (raysRef.current) {
        raysRef.current.style.opacity = (0.4 + Math.sin(t * 0.45 + 1) * 0.18).toFixed(3);
        raysRef.current.style.transform = `translate(-50%, -50%) rotate(${(t * 4).toFixed(2)}deg)`;
      }

      // Tube — gentle vertical bob with a whisper of tilt
      const bob = Math.sin(t * 0.85) * 12;
      if (tubeRef.current) {
        const tilt = Math.sin(t * 0.55) * 1.2;
        tubeRef.current.style.transform =
          `translate3d(calc(-50% + ${(mx * PX.tube.m).toFixed(1)}px), calc(-50% + ${(bob + my * PX.tube.m + sy * PX.tube.s).toFixed(1)}px), 0) rotate(${tilt.toFixed(2)}deg)`;
      }
      if (shadowRef.current) {
        // Shadow tightens as the tube dips, spreads as it rises
        const k = 1 - bob / 60;
        shadowRef.current.style.opacity = (0.55 - bob / 50).toFixed(3);
        shadowRef.current.style.transform = `translate(-50%, ${(sy * PX.tube.s).toFixed(1)}px) scale(${k.toFixed(3)}, 1)`;
      }

      // Sunflower heads — arc along the orbit with a local loop; the whole
      // head + leaves tilts in 3D while the bloom itself spins independently
      HEADS.forEach((h, i) => {
        const el = headRefs.current[i];
        if (!el) return;
        const a = h.base + Math.sin((t / h.period) * TAU) * h.amp;
        const w = TAU / (h.period * 0.6);
        const lx = Math.cos(t * w) * h.loop * sc;
        const ly = Math.sin(t * w) * h.loop * 0.7 * sc;
        const x = cx + Math.cos(a) * h.rx * W + lx + mx * 0.03 * h.depth;
        const y = cy + Math.sin(a) * h.ry * H + ly + my * 0.03 * h.depth + sy * 0.12 * h.depth;
        const size = h.size * sc;
        const rx3 = Math.sin(t * w * 0.7 + i) * h.tilt;
        const ry3 = Math.cos(t * w * 0.5 + i * 2) * h.tilt;
        const rz  = Math.sin(t * 0.25 + i) * 8 + h.base * 20;
        el.style.transform =
          `translate3d(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px, 0) ` +
          `perspective(700px) rotateX(${rx3.toFixed(1)}deg) rotateY(${ry3.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
        const spin = headSpinRefs.current[i];
        if (spin) spin.style.transform = `rotate(${(t * h.spin).toFixed(1)}deg)`;
      });

      // Corner cluster — sways from its stem
      if (clusterRef.current) {
        const sway = Math.sin(t * 0.5) * 2.2;
        clusterRef.current.style.transform =
          `translate3d(${(mx * 0.04).toFixed(1)}px, ${(my * 0.03 + sy * 0.15).toFixed(1)}px, 0) rotate(${sway.toFixed(2)}deg)`;
      }

      // Petals & leaves — 3D orbit: depth drives scale, blur, opacity and z-order
      FLYERS.forEach((f, i) => {
        const el = flyerRefs.current[i];
        if (!el) return;
        const a = f.dir * (t / f.period) * TAU + f.phase;
        const z = Math.sin(a);                         // -1 back … +1 front
        const r = f.r * W;
        const x = cx + Math.cos(a) * r;
        const y = cy + f.dy * H + z * r * f.tilt + Math.sin(t * 0.7 + f.phase) * 10;
        const depthScale = 0.72 + (z + 1) * 0.22;      // 0.72 … 1.16
        const pm = 0.01 + (z + 1) * 0.02;
        const size = f.size * sc * 1.3;
        const zi = z > 0 ? BOTTLE_Z + 10 : BOTTLE_Z - 10;
        if (lastZ[i] !== zi) { el.style.zIndex = String(zi); lastZ[i] = zi; }
        const blur = z < -0.3 ? Math.round((-z - 0.3) * 2.2 * 2) / 2 : 0;   // 0.5px steps
        if (lastBlur[i] !== blur) { el.style.filter = blur ? `blur(${blur}px)` : 'none'; lastBlur[i] = blur; }
        el.style.opacity = (0.55 + (z + 1) * 0.22).toFixed(3);
        el.style.transform =
          `translate3d(${(x - size / 2 + mx * pm).toFixed(1)}px, ${(y - size / 2 + my * pm + sy * pm * 6).toFixed(1)}px, 0) ` +
          `perspective(500px) scale(${depthScale.toFixed(3)}) rotateZ(${(a * 57.3 * 0.6).toFixed(1)}deg) ` +
          `rotateY(${(t * f.flip).toFixed(1)}deg) rotateX(${(Math.sin(t * 0.8 + f.phase) * 25).toFixed(1)}deg)`;
      });
    };

    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      if (visible) render((ts - t0) * 0.001);
      raf = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      render(6);   // static, composed frame
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('mousemove', onMove);
    };
  }, [reduceMotion]);

  // Shared absolute-positioned layer style for RAF-driven nodes
  const node: React.CSSProperties = { position: 'absolute', left: 0, top: 0, willChange: 'transform' };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        height: '100svh',
        minHeight: 620,
        background:
          'radial-gradient(ellipse 70% 60% at 50% 42%, #FFF6D6 0%, #FFF9EC 45%, #FCEFC9 100%)',
      }}
    >
      {/* ── Warm ambient wash ─────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            'radial-gradient(ellipse 40% 35% at 90% 10%, rgba(247,201,40,0.18), transparent 70%),' +
            'radial-gradient(ellipse 45% 40% at 6% 92%, rgba(247,201,40,0.16), transparent 70%)',
        }}
      />

      {/* ── Oversized low-opacity typography (deepest parallax layer) ─── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.4 }}
      >
        <div
          ref={textRef}
          className="absolute inset-x-0 flex justify-center"
          style={{ top: '45%', marginTop: '-0.62em', fontSize: 'clamp(4rem, 15.5vw, 18rem)', willChange: 'transform' }}
        >
          <span
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg, rgba(222,190,110,0.45) 0%, rgba(214,176,88,0.3) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            SUNFLOWER
          </span>
        </div>
      </motion.div>

      {/* ── Far particles ─────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {FAR_PARTICLES.map((p, i) => (
          <div
            key={i}
            ref={el => { farRefs.current[i] = el; }}
            style={{
              ...node,
              width: p.s,
              height: p.s,
              opacity: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #F7C928 0%, rgba(201,154,37,0) 70%)',
            }}
          />
        ))}
      </div>

      {/* ── Orbital scene ─────────────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.2 }}
      >
        {/* Golden shimmer behind the tube */}
        <div className="absolute" style={{ left: '50%', top: '45%', zIndex: BOTTLE_Z - 2 }}>
          <div
            ref={raysRef}
            style={{
              position: 'absolute',
              left: 0, top: 0,
              width: 'min(110vh, 120vw)',
              height: 'min(110vh, 120vw)',
              transform: 'translate(-50%, -50%)',
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,214,90,0.28) 0deg 4deg, rgba(255,214,90,0) 4deg 15deg)',
              WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 62%)',
              maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 30%, transparent 62%)',
              filter: 'blur(6px)',
              willChange: 'transform, opacity',
            }}
          />
          <div
            ref={glowRef}
            style={{
              position: 'absolute',
              left: 0, top: 0,
              width: 'min(58vh, 70vw)',
              height: 'min(72vh, 86vw)',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,226,112,0.8) 0%, rgba(247,201,40,0.32) 40%, rgba(247,201,40,0) 72%)',
              filter: 'blur(28px)',
              willChange: 'transform, opacity',
            }}
          />
        </div>

        {/* Contact shadow */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: 'calc(45% + min(27svh, 34vw))',
            width: 'min(16svh, 20vw)',
            height: 18,
            transform: 'translate(-50%, 0)',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(120,86,20,0.38) 0%, transparent 70%)',
            filter: 'blur(6px)',
            zIndex: BOTTLE_Z - 1,
          }}
        />

        {/* Product tube */}
        <motion.div
          className="absolute"
          style={{ left: '50%', top: '45%', zIndex: BOTTLE_Z }}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div
            ref={tubeRef}
            style={{
              position: 'absolute',
              width: 'min(66svh, 82vw)',
              height: 'min(66svh, 82vw)',
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
            }}
          >
            <Image
              src={IMG.tube}
              alt="Miss Sunflower Sun Serum SPF 50+ PA++++"
              fill
              sizes="(max-width: 768px) 82vw, 66vh"
              preload
              unoptimized
              className="object-contain"
              style={{ filter: 'drop-shadow(0 28px 40px rgba(170,120,20,0.28))' }}
            />
          </div>
        </motion.div>

        {/* Sunflower heads (with leaves tucked behind some) */}
        {HEADS.map((h, i) => (
          <div
            key={`head-${i}`}
            ref={el => { headRefs.current[i] = el; }}
            style={{
              ...node,
              width: h.size,
              height: h.size,
              zIndex: h.depth > 1 ? BOTTLE_Z + 12 : BOTTLE_Z - 6,
              filter: `${h.blur ? `blur(${h.blur}px) ` : ''}drop-shadow(0 14px 22px rgba(160,110,20,0.25))`,
            }}
          >
            {h.leaves.map((l, j) => (
              <div
                key={j}
                style={{
                  position: 'absolute',
                  width: `${l.s * 100}%`,
                  height: `${l.s * 100}%`,
                  left: `${(0.5 + l.x - l.s / 2) * 100}%`,
                  top: `${(0.5 + l.y - l.s / 2) * 100}%`,
                  transform: `rotate(${l.rot}deg)`,
                }}
              >
                <Image src={IMG.leaf} alt="" fill sizes="240px" loading="eager" className="object-contain" />
              </div>
            ))}
            <div ref={el => { headSpinRefs.current[i] = el; }} style={{ position: 'absolute', inset: 0 }}>
              <Image src={IMG.head} alt="" fill sizes="300px" loading="eager" className="object-contain" />
            </div>
          </div>
        ))}

        {/* Corner sunflower cluster */}
        <div
          className="absolute"
          style={{ right: '-4%', bottom: '-6%', width: 'clamp(220px, 30vw, 460px)', aspectRatio: '1', zIndex: BOTTLE_Z + 8 }}
        >
          <div
            ref={clusterRef}
            style={{
              position: 'absolute', inset: 0,
              transformOrigin: '50% 100%',
              willChange: 'transform',
              filter: 'drop-shadow(0 18px 30px rgba(140,100,20,0.22))',
            }}
          >
            <Image src={IMG.cluster} alt="" fill sizes="460px" loading="eager" className="object-contain" />
          </div>
        </div>

        {/* Petals & leaves (z-index swaps in front of / behind the tube) */}
        {FLYERS.map((f, i) => (
          <div
            key={`fly-${i}`}
            ref={el => { flyerRefs.current[i] = el; }}
            style={{ ...node, width: f.size, height: f.size, opacity: 0 }}
          >
            <Image src={f.img} alt="" fill sizes="120px" loading="eager" className="object-contain" />
          </div>
        ))}
      </motion.div>

      {/* ── Near particles (fastest layer) ────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 35 }}>
        {NEAR_PARTICLES.map((p, i) => (
          <div
            key={i}
            ref={el => { nearRefs.current[i] = el; }}
            style={{
              ...node,
              width: p.s,
              height: p.s,
              opacity: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFF3B0 0%, #F7C928 35%, rgba(201,154,37,0) 72%)',
              boxShadow: '0 0 10px rgba(247,201,40,0.55)',
            }}
          />
        ))}
      </div>

      {/* ── Headline ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 text-center"
        style={{ zIndex: 40, paddingBottom: 'clamp(28px, 5svh, 56px)' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.6rem, 5.6vw, 5rem)',
            fontWeight: 600,
            color: '#6B4F1D',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 18px rgba(255,249,236,0.9)',
          }}
        >
          Glow in the Sun.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.25 }}
          style={{
            marginTop: 10,
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1rem, 1.6vw, 1.3rem)',
            fontWeight: 500,
            color: '#4A3A24',
            lineHeight: 1.4,
            maxWidth: '40ch',
            textShadow: '0 1px 12px rgba(255,249,236,0.9)',
          }}
        >
          A lightweight, hydrating daily sun serum that protects and illuminates without the white cast.
        </motion.p>
      </div>
    </section>
  );
}
