'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Product', href: '#product' },
  { label: 'Our Story', href: '#story' },
  { label: 'Ingredients', href: '#ingredients' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#FFF9EC]/90 backdrop-blur-md shadow-sm border-b border-[#F7C928]/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="#home" onClick={(e) => handleNavClick(e, '#home')}>
            <motion.div
              className="flex flex-col leading-none cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <span
                className="text-2xl font-normal italic"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  color: '#332719',
                  letterSpacing: '-0.01em',
                }}
              >
                Miss
              </span>
              <span
                className="text-2xl font-semibold"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  color: '#C99A25',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  marginTop: '-4px',
                }}
              >
                Sunflower
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative text-sm font-medium tracking-widest uppercase text-[#332719] hover:text-[#C99A25] transition-colors duration-300 group"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem' }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C99A25] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#332719] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-20 left-0 right-0 z-40 overflow-hidden bg-[#FFF9EC]/95 backdrop-blur-lg border-b border-[#F7C928]/20 md:hidden"
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-3 text-sm font-medium tracking-widest uppercase text-[#332719] hover:text-[#C99A25] transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}
