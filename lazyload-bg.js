/**
 * Lazyload for Three.js background
 * - Detects connection speed & device capability
 * - Disables background on slow connections or low-end devices
 * - Loads background asynchronously after main content
 */
(function() {
  'use strict';

  // Config: set to false to disable background entirely
  const BG_ENABLED = true;
  const BG_MIN_WIDTH = 768; // Skip bg on very small screens

  function shouldLoadBackground() {
    if (!BG_ENABLED) return false;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

    // Skip on narrow screens (mobile portrait)
    if (window.innerWidth < BG_MIN_WIDTH) return false;

    // Skip on slow connections
    if (navigator.connection) {
      const conn = navigator.connection;
      if (conn.saveData) return false;
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false;
    }

    // Skip on low-end devices (memory check)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;

    // Skip on older browsers without WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;

    return true;
  }

  function loadBackground() {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'assets/js/background.js';
    script.async = true;
    document.body.appendChild(script);
  }

  // Init
  if (shouldLoadBackground()) {
    // Load background after page is interactive
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // Delay bg load to prioritize content
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadBackground, { timeout: 2000 });
        } else {
          setTimeout(loadBackground, 100);
        }
      });
    } else {
      loadBackground();
    }
  } else {
    // Show fallback gradient if bg disabled
    const fallback = document.getElementById('bg-fallback');
    if (fallback) fallback.style.display = 'grid';
  }
})();
