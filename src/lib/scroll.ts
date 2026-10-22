import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Scroll to a section, through Lenis when it is active so the two never fight.
export function scrollToSection(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
