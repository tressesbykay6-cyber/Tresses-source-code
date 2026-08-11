import React, { useEffect, useRef } from 'react';

export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
}): React.RefObject<HTMLDivElement> {
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = options?.threshold ?? 0.15;
  const rootMargin = options?.rootMargin ?? '0px 0px -60px 0px';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Find all descendant elements inside the container matching [class*='reveal']
    const elements: HTMLElement[] = Array.from(
      container.querySelectorAll<HTMLElement>("[class*='reveal']")
    );

    // Also include container itself if it matches [class*='reveal']
    if (container.matches("[class*='reveal']")) {
      elements.push(container);
    }

    if (elements.length === 0) return;

    // If user prefers reduced motion, reveal elements immediately
    if (prefersReducedMotion) {
      elements.forEach((el: HTMLElement) => el.classList.add('visible'));
      return;
    }

    // Fallback if IntersectionObserver is not supported
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el: HTMLElement) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    elements.forEach((el: HTMLElement) => {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return containerRef as React.RefObject<HTMLDivElement>;
}
