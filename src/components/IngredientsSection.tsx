'use client';

import { motion } from 'framer-motion';

const INGREDIENTS = [
  {
    name: 'Sunflower Seed Oil',
    latin: 'Helianthus annuus',
    icon: '🌻',
    benefit: 'Rich in Vitamin E and linoleic acid, deeply nourishes and protects the skin barrier.',
    color: '#F7C928',
  },
  {
    name: 'Zinc Oxide',
    latin: 'Mineral Filter',
    icon: '◎',
    benefit: 'Provides broad-spectrum UVA/UVB protection with a gentle, non-irritating formula.',
    color: '#C99A25',
  },
  {
    name: 'Hyaluronic Acid',
    latin: 'Sodium Hyaluronate',
    icon: '◇',
    benefit: 'Attracts and locks in moisture for 24-hour hydration and a plumped, dewy glow.',
    color: '#F7C928',
  },
  {
    name: 'Niacinamide',
    latin: 'Vitamin B3',
    icon: '✦',
    benefit: 'Evens skin tone, minimizes pores, and brightens for a naturally luminous complexion.',
    color: '#C99A25',
  },
  {
    name: 'Centella Asiatica',
    latin: 'Cica Extract',
    icon: '❋',
    benefit: 'Calms inflammation and supports the skin\'s natural healing and repair process.',
    color: '#F7C928',
  },
  {
    name: 'Vitamin C',
    latin: 'Ascorbyl Glucoside',
    icon: '✿',
    benefit: 'Neutralizes free radicals from UV exposure and promotes a brighter, even skin tone.',
    color: '#C99A25',
  },
];

export default function IngredientsSection() {
  return (
    <section
      id="ingredients"
      className="relative overflow-hidden py-24 lg:py-36"
      style={{
        background: 'linear-gradient(180deg, #FFF9EC 0%, #FFFBF0 100%)',
      }}
    >
      {/* Large decorative text background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20vw',
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(199,154,37,0.08)',
            whiteSpace: 'nowrap',
          }}
        >
          INGREDIENTS
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C99A25' }}
          >
            Clean & Conscious
          </p>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 600,
              color: '#332719',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Crafted with
            <br />
            <em style={{ color: '#C99A25' }}>nature&apos;s finest.</em>
          </h2>
        </motion.div>

        {/* Ingredients list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INGREDIENTS.map((ing, i) => (
            <motion.div
              key={ing.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative p-7 rounded-3xl overflow-hidden cursor-default"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(199,154,37,0.12)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 30px rgba(199,154,37,0.06)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 20% 30%, ${ing.color}10 0%, transparent 60%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="text-3xl group-hover:scale-110 transition-transform duration-300 inline-block"
                    style={{ color: ing.color }}
                  >
                    {ing.icon}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${ing.color}20`, color: ing.color }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>

                <h3
                  className="mb-1"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: '#332719',
                  }}
                >
                  {ing.name}
                </h3>
                <p
                  className="mb-3 italic"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.72rem',
                    color: '#C99A25',
                    letterSpacing: '0.03em',
                  }}
                >
                  {ing.latin}
                </p>
                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.82rem',
                    color: '#5a4530',
                    lineHeight: 1.7,
                    opacity: 0.85,
                  }}
                >
                  {ing.benefit}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{ background: `linear-gradient(to right, ${ing.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.82rem',
              color: '#5a4530',
              opacity: 0.7,
              letterSpacing: '0.05em',
            }}
          >
            Free from parabens · mineral oil · artificial fragrance · silicones
          </p>
        </motion.div>
      </div>
    </section>
  );
}
