import { useEffect, useRef } from 'react';

/**
 * Attaches scroll-reveal behaviour to children with class "reveal".
 * Adds `js-reveal` to <body> so CSS hides elements before JS evaluates them
 * (prevents flash of invisible content on pages that never scroll).
 */
export default function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    // Only gate visibility after JS is running
    document.body.classList.add('js-reveal');

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    const items = el.querySelectorAll('.reveal');
    items.forEach((item) => {
      // Immediately reveal items already in the viewport
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        item.classList.add('visible');
      } else {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}
