import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global ScrollToTop Component
 * Ensures every internal route navigation resets the scroll position to the top (0, 0),
 * preventing destination pages from opening near the bottom/footer.
 * Preserves intentional anchor scrolling when a hash is present (e.g., #contact).
 * Also resets any internal scrollable containers (such as admin dashboard main areas).
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 1. If an anchor hash exists (e.g., #pricing, #contact), scroll to that specific element
    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // 2. Otherwise, instantly reset the window and document scroll position to top
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Reset any internal scroll containers if present (e.g., admin layout <main className="overflow-auto">)
    const customScrollContainers = document.querySelectorAll<HTMLElement>(
      'main.overflow-auto, main.overflow-y-auto, [data-scroll-container]'
    );
    customScrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
