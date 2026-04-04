'use client';

import { useCallback, useRef } from 'react';

/**
 * Custom hook that applies IntersectionObserver to an element ref.
 * When the element enters the viewport (threshold 0.15), adds 'revealed' class.
 * Once revealed, stays revealed (unobserves).
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <div ref={ref} className="scroll-reveal">...</div>
 *
 * CSS needed on the element:
 *   .scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
 *   .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(): (node: T | null) => void {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const callbackRef = useCallback((node: T | null) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return callbackRef;
}
