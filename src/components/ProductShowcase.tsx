'use client';

import { Fragment, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';

// ─── Assets (all transparent PNGs in /public/images/products) ───────────────
const IMG = {
  tube:  '/images/products/4.png',
  petal: '/images/products/2.png',
};

const TAU = Math.PI * 2;

// ─── Timeline (seconds within one seamless loop) ────────────────────────────
// enter → orbit + ivory→gold → "Discover the Formula" → ascend out → reset (off-screen)
const CYCLE = 15;
const T = {
  enter:   [0.0, 2.8],    // rises from the bottom, scaling up into the centre
  gather:  [0.8, 3.6],    // petals sweep in to their orbit
  gold:    [2.8, 6.2],    // background warms from ivory to golden yellow
  shift:   [5.6, 7.0],    // tube eases left to make room for the copy (desktop)
  words:   [6.2, 7.4],    // headline reveal (staggered per word)
  sub:     [7.4, 8.4],
  textOut: [10.6, 11.4],
  center:  [10.4, 11.6],  // tube drifts back to centre
  exit:    [11.2, 13.6],  // ascends vertically out of frame
  reset:   [13.8, 14.9],  // background returns to ivory while the stage is empty
} as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
const easeIn = (v: number) => v * v * v;
const lerp = (a: number, b: number, v: number) => a + (b - a) * v;

// Deterministic PRNG so server and client render identical markup
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(4242);

// Orbiting petals: angle offset, size (fraction of tube box), radius jitter, trail lag
const PETALS = Array.from({ length: 18 }, (_, i) => ({
  a0: (i / 18) * TAU + rand() * 0.25,
  size: 0.1 + rand() * 0.07,
  rj: 0.86 + rand() * 0.28,
  yj: (rand() - 0.5) * 0.1,
  lag: rand(),
  flip: 50 + rand() * 60,
  ph: rand() * TAU,
}));
// Gold dust riding the orbit
const DUST = Array.from({ length: 50 }, () => ({
  a0: rand() * TAU,
  rj: 0.9 + rand() * 0.2,
  yj: (rand() - 0.5) * 0.06,
  s: 1.5 + rand() * 3,
  sp: 0.8 + rand() * 0.6,
}));
// Shimmering golden-hour motes across the whole frame
const MOTES = Array.from({ length: 36 }, () => ({
  x: rand(), y: rand(),
  s: 1.5 + rand() * 3.5,
  v: 6 + rand() * 16,
  w: 0.2 + rand() * 0.5,
  a: 10 + rand() * 25,
  ph: rand() * TAU,
  tw: 0.8 + rand() * 1.6,
}));

export default function ProductShowcase() {
  const reduceMotion = useReducedMotion();

  const stageRef  = useRef<HTMLElement | null>(null);
  const goldBgRef = useRef<HTMLDivElement | null>(null);
  const beamsRef  = useRef<HTMLDivElement | null>(null);
  const sunRef    = useRef<HTMLDivElement | null>(null);
  const haloRef   = useRef<HTMLDivElement | null>(null);
  const raysRef   = useRef<HTMLDivElement | null>(null);
  const tubeRef   = useRef<HTMLDivElement | null>(null);
  const sweepRef  = useRef<HTMLDivElement | null>(null);
  const ringRef   = useRef<HTMLDivElement | null>(null);
  const textRef   = useRef<HTMLDivElement | null>(null);
  const wordRefs  = useRef<(HTMLSpanElement | null)[]>([]);
  const subRef    = useRef<HTMLDivElement | null>(null);
  const petalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dustRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const moteRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let W = stage.clientWidth;
    let H = stage.clientHeight;
    const ro = new ResizeObserver(() => {
      W = stage.clientWidth;
      H = stage.clientHeight;
    });
    ro.observe(stage);

    // The film starts from frame 0 the first time the section is seen,
    // and pauses (keeping its place) whenever it is off-screen
    let visible = false;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.35 });
    io.observe(stage);

    let raf = 0;
    let clock = 0;
    let last = 0;

    // tl: time within the loop · t: total time (continuous ambient motion)
    const render = (tl: number, t: number) => {
      const mobile = W < 768;
      const S = Math.min(H * 0.78, W * (mobile ? 0.95 : 0.6));   // tube image box

      const enter  = easeOut(seg(tl, T.enter));
      const gather = easeOut(seg(tl, T.gather));
      const exit   = easeIn(seg(tl, T.exit));
      const gold   = easeInOut(seg(tl, T.gold)) * (1 - easeInOut(seg(tl, T.reset)));
      const onStage = (1 - easeInOut(seg(tl, [12.6, 13.6])));          // petals/dust fade once the tube is gone

      // ── Background: warm ivory → rich golden yellow ─────────────────
      if (goldBgRef.current) goldBgRef.current.style.opacity = gold.toFixed(3);
      if (beamsRef.current) {
        beamsRef.current.style.opacity = (0.45 + gold * 0.4 + Math.sin(t * 0.35) * 0.12).toFixed(3);
        beamsRef.current.style.transform = `translate3d(${(Math.sin(t * 0.08) * 30).toFixed(1)}px, 0, 0)`;
      }
      if (sunRef.current) {
        const op = easeInOut(seg(tl, [0.3, 1.6])) * (1 - easeInOut(seg(tl, [3.2, 5.0])));
        sunRef.current.style.opacity = op.toFixed(3);
        sunRef.current.style.transform =
          `translate3d(-50%, calc(-50% + ${lerp(30, -40, seg(tl, [0, 5])).toFixed(1)}px), 0)`;
      }

      // ── Tube path ───────────────────────────────────────────────────
      const bob = Math.sin(t * 0.9) * 8 * enter * (1 - exit);
      const shift = easeInOut(seg(tl, T.shift)) * (1 - easeInOut(seg(tl, T.center)));
      const cx = W / 2 + (mobile ? 0 : -W * 0.19) * shift;
      const cy =
        H / 2 +
        lerp(H * 0.85, 0, enter) +              // enter from the bottom
        (mobile ? -H * 0.13 : 0) * shift +
        lerp(0, -H * 1.4, exit) +               // ascend out of the top
        bob;
      const sc = lerp(0.68, 1, enter) * lerp(1, mobile ? 0.8 : 0.94, shift) * lerp(1, 0.86, exit);
      const rot =
        lerp(-14, -6, enter) +
        easeInOut(seg(tl, [3.0, 5.6])) * 16 -    // leans into the orbit
        shift * 20 +                              // tilts toward the copy
        easeInOut(seg(tl, T.exit)) * 10 +         // straightens as it rises
        Math.sin(t * 0.6) * 1.5;
      if (tubeRef.current) {
        tubeRef.current.style.width = tubeRef.current.style.height = `${S.toFixed(0)}px`;
        tubeRef.current.style.transform =
          `translate3d(${(cx - S / 2).toFixed(1)}px, ${(cy - S / 2).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      }
      if (sweepRef.current) {
        const pos = ((t * 0.2) % 1.7) - 0.35;
        sweepRef.current.style.backgroundPosition = `${(pos * 100).toFixed(1)}% 0, ${(100 - pos * 80).toFixed(1)}% 0`;
        sweepRef.current.style.opacity = (0.4 + 0.6 * gold).toFixed(3);
      }

      // Golden light behind the tube follows it
      if (haloRef.current) {
        const k = 1 + Math.sin(t * 0.7) * 0.06;
        haloRef.current.style.opacity = ((0.55 + 0.45 * gold) * enter * (1 - exit)).toFixed(3);
        haloRef.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${k.toFixed(3)})`;
      }
      if (raysRef.current) {
        raysRef.current.style.opacity = (gold * 0.7 * (1 - exit)).toFixed(3);
        raysRef.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(t * 5).toFixed(1)}deg)`;
      }

      // ── Orbit: ring, dust, petals ───────────────────────────────────
      const R = S * 0.5 * lerp(2.2, 1, gather);
      const tilt = 0.32;
      const ringRot = (-16 + shift * -8) * Math.PI / 180;
      const cr = Math.cos(ringRot), sr = Math.sin(ringRot);
      const spin = t * 0.5;
      const orbitOp = gather * onStage;

      if (ringRef.current) {
        ringRef.current.style.opacity = (orbitOp * gold * 0.85 * (1 - exit)).toFixed(3);
        ringRef.current.style.width = `${(R * 2).toFixed(0)}px`;
        ringRef.current.style.height = `${(R * 2 * tilt).toFixed(0)}px`;
        ringRef.current.style.transform =
          `translate3d(${(cx - R).toFixed(1)}px, ${(cy - R * tilt).toFixed(1)}px, 0) rotate(${(ringRot * 57.3).toFixed(2)}deg)`;
      }
      DUST.forEach((d, i) => {
        const el = dustRefs.current[i];
        if (!el) return;
        const a = d.a0 + spin * d.sp * 1.5;
        const ox = Math.cos(a) * R * d.rj;
        const oy = Math.sin(a) * R * tilt * d.rj + d.yj * S;
        const x = cx + ox * cr - oy * sr;
        const y = cy + ox * sr + oy * cr + exit * H * 0.25;
        el.style.opacity = (orbitOp * (0.3 + 0.7 * gold) * (0.5 + 0.5 * Math.sin(t * 2 + i))).toFixed(3);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
      PETALS.forEach((pt, i) => {
        const el = petalRefs.current[i];
        if (!el) return;
        const a = pt.a0 + spin;
        const ox = Math.cos(a) * R * pt.rj;
        const oy = Math.sin(a) * R * tilt * pt.rj + pt.yj * S;
        const z = Math.sin(a);                                  // -1 back … +1 front
        const x = cx + ox * cr - oy * sr;
        // While the tube rises, each petal trails behind it by its own lag
        const y = cy + ox * sr + oy * cr + exit * H * (0.15 + pt.lag * 0.45);
        const size = pt.size * S;
        const depth = 0.72 + (z + 1) * 0.22;
        el.style.width = el.style.height = `${size.toFixed(0)}px`;
        el.style.zIndex = z > 0 ? '12' : '8';
        el.style.opacity = (orbitOp * (0.65 + (z + 1) * 0.17)).toFixed(3);
        el.style.filter = z < -0.4 ? `blur(${((-z - 0.4) * 2).toFixed(2)}px)` : 'none';
        el.style.transform =
          `translate3d(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px, 0) perspective(500px) ` +
          `scale(${depth.toFixed(3)}) rotateZ(${((a * 57.3 + 90) % 360).toFixed(1)}deg) ` +
          `rotateY(${(t * pt.flip).toFixed(1)}deg) rotateX(${(Math.sin(t + pt.ph) * 25).toFixed(1)}deg)`;
      });

      // ── Golden-hour motes ───────────────────────────────────────────
      const span = H + 40;
      MOTES.forEach((m, i) => {
        const el = moteRefs.current[i];
        if (!el) return;
        const y = ((((m.y * span - t * m.v) % span) + span) % span) - 20;
        const x = m.x * W + Math.sin(t * m.w + m.ph) * m.a;
        el.style.opacity = ((0.25 + 0.55 * gold) * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * m.tw + m.ph)))).toFixed(3);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });

      // ── "Discover the Formula" ──────────────────────────────────────
      if (textRef.current) textRef.current.style.opacity = (1 - easeInOut(seg(tl, T.textOut))).toFixed(3);
      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        const [a, b] = T.words;
        const v = easeOut(seg(tl, [a + i * 0.25, b + i * 0.25]));
        el.style.opacity = v.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - v) * 105).toFixed(1)}%, 0)`;
        el.style.filter = `blur(${((1 - v) * 6).toFixed(2)}px)`;
      });
      if (subRef.current) {
        const v = easeOut(seg(tl, T.sub));
        subRef.current.style.opacity = v.toFixed(3);
        subRef.current.style.transform = `translate3d(0, ${((1 - v) * 16).toFixed(1)}px, 0)`;
      }
    };

    const tick = (ts: number) => {
      const dt = last ? Math.min(0.1, (ts - last) * 0.001) : 0;
      last = ts;
      if (visible) {
        clock += dt;
        render(clock % CYCLE, clock);
      }
      raf = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      render(8.6, 0);   // still frame: tube centred in the golden scene with the copy revealed
    } else {
      render(0, 0);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduceMotion]);

  const node: React.CSSProperties = { position: 'absolute', left: 0, top: 0, willChange: 'transform' };
  const words = ['Discover', 'the', 'Formula'];

  return (
    <section
      id="product-detail"
      ref={stageRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: 620 }}
    >
      {/* ── Background: warm ivory → rich golden-yellow radial ─────────── */}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 45%, #FFF8E8 0%, #F8EBCF 60%, #EFDDB6 100%)' }} />
      <div
        ref={goldBgRef}
        aria-hidden
        className="absolute inset-0"
        style={{ opacity: 0, background: 'radial-gradient(ellipse 75% 75% at 50% 45%, #FFD95A 0%, #F2B930 38%, #D69A1E 72%, #A8701A 100%)' }}
      />

      {/* Golden-hour light beams */}
      <div
        ref={beamsRef}
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          inset: '-20%',
          background:
            'repeating-linear-gradient(115deg, rgba(255,250,225,0) 0px, rgba(255,250,225,0) 110px, rgba(255,248,215,0.5) 160px, rgba(255,250,225,0) 220px, rgba(255,250,225,0) 360px)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 22% 15%, #000 0%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse 70% 80% at 22% 15%, #000 0%, transparent 75%)',
          filter: 'blur(14px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Giant muted "SUN" behind the entrance */}
      <div
        ref={sunRef}
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          left: '50%', top: '46%',
          opacity: 0,
          transform: 'translate3d(-50%, -50%, 0)',
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 500,
          fontSize: 'min(52vh, 40vw)',
          lineHeight: 1,
          letterSpacing: '0.02em',
          color: 'rgba(168,128,62,0.26)',
          whiteSpace: 'nowrap',
          willChange: 'transform, opacity',
        }}
      >
        SUN
      </div>

      {/* Shimmering motes */}
      {MOTES.map((m, i) => (
        <div
          key={`m${i}`}
          ref={el => { moteRefs.current[i] = el; }}
          aria-hidden
          style={{
            ...node,
            width: m.s, height: m.s,
            opacity: 0,
            borderRadius: '50%',
            background: '#FFF3C2',
            boxShadow: '0 0 8px 2px rgba(255,220,120,0.7)',
          }}
        />
      ))}

      {/* Light behind the tube: halo + slowly turning rays */}
      <div
        ref={raysRef}
        aria-hidden
        className="pointer-events-none"
        style={{
          ...node,
          width: 'min(120vh, 130vw)',
          height: 'min(120vh, 130vw)',
          opacity: 0,
          background: 'repeating-conic-gradient(from 0deg, rgba(255,246,200,0.4) 0deg 4deg, rgba(255,246,200,0) 4deg 14deg)',
          WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 25%, transparent 58%)',
          maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 25%, transparent 58%)',
          filter: 'blur(4px)',
        }}
      />
      <div
        ref={haloRef}
        aria-hidden
        className="pointer-events-none"
        style={{
          ...node,
          width: 'min(64vh, 72vw)',
          height: 'min(80vh, 90vw)',
          opacity: 0,
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,250,215,0.9) 0%, rgba(255,226,120,0.45) 40%, rgba(255,210,90,0) 72%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Orbit light ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none"
        style={{
          ...node,
          opacity: 0,
          zIndex: 9,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,240,190,0.7)',
          boxShadow: '0 0 18px rgba(255,226,140,0.6), inset 0 0 18px rgba(255,226,140,0.35)',
        }}
      />

      {/* Gold dust */}
      {DUST.map((d, i) => (
        <div
          key={`d${i}`}
          ref={el => { dustRefs.current[i] = el; }}
          aria-hidden
          style={{
            ...node,
            width: d.s, height: d.s,
            opacity: 0,
            zIndex: 11,
            borderRadius: '50%',
            background: '#FFF4C4',
            boxShadow: '0 0 6px 1px rgba(255,220,100,0.9)',
          }}
        />
      ))}

      {/* Product tube */}
      <div ref={tubeRef} style={{ ...node, width: 400, height: 400, zIndex: 10, transform: 'translate3d(0, 120vh, 0)' }}>
        <div className="absolute inset-0" style={{ filter: 'drop-shadow(0 30px 40px rgba(110,70,10,0.3))' }}>
          <Image
            src={IMG.tube}
            alt="Miss Sunflower Sun Serum SPF 50+ PA++++"
            fill
            sizes="(max-width: 768px) 95vw, 60vw"
            unoptimized
            className="object-contain"
          />
        </div>
        {/* Golden shimmer gliding across the tube, masked to its silhouette */}
        <div
          ref={sweepRef}
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.75) 48%, rgba(255,246,200,0.2) 52%, transparent 60%),' +
              'linear-gradient(75deg, transparent 44%, rgba(255,250,220,0.45) 50%, transparent 56%)',
            backgroundSize: '250% 100%, 300% 100%',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: `url(${IMG.tube})`,
            maskImage: `url(${IMG.tube})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Orbiting petals (z-index swaps in front of / behind the tube) */}
      {PETALS.map((_, i) => (
        <div
          key={`p${i}`}
          ref={el => { petalRefs.current[i] = el; }}
          aria-hidden
          style={{ ...node, width: 50, height: 50, opacity: 0, filter: 'drop-shadow(0 8px 10px rgba(120,80,10,0.25))' }}
        >
          <Image src={IMG.petal} alt="" fill sizes="120px" className="object-contain" />
        </div>
      ))}

      {/* "Discover the Formula" */}
      <div
        ref={textRef}
        className="absolute inset-x-6 bottom-[9%] text-center md:inset-x-auto md:bottom-auto md:right-[7%] md:top-[50%] md:-translate-y-1/2 md:w-[38%] md:text-left"
        style={{ zIndex: 15 }}
      >
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.8rem, 6.4vw, 6rem)',
            fontWeight: 500,
            lineHeight: 1.02,
            color: '#FFF8E6',
            letterSpacing: '-0.01em',
            textShadow: '0 2px 28px rgba(120,70,0,0.35)',
          }}
        >
          {words.map((w, i) => (
            <Fragment key={w}>
              <span className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.08em' }}>
                <span
                  ref={el => { wordRefs.current[i] = el; }}
                  className="inline-block"
                  style={{ opacity: 0, transform: 'translate3d(0,105%,0)', willChange: 'transform, opacity' }}
                >
                  {w}
                </span>
              </span>
              {i === 0 ? <br /> : i === 1 ? ' ' : null}
            </Fragment>
          ))}
        </h2>
        <div ref={subRef} style={{ opacity: 0 }}>
          <p
            className="mt-4 md:mt-5 mx-auto md:mx-0"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
              lineHeight: 1.7,
              color: '#FFF4D6',
              maxWidth: '34ch',
              textShadow: '0 1px 14px rgba(120,70,0,0.35)',
            }}
          >
            A featherlight sun serum with SPF 50+ PA++++, enriched with sunflower seed oil for a natural golden glow.
          </p>
        </div>
      </div>
    </section>
  );
}
