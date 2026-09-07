/**
 * Lazyload for Three.js background
 */
(function() {
  'use strict';

  function loadBackground() {
    // Add importmap first
    const importmap = document.createElement('script');
    importmap.type = 'importmap';
    importmap.textContent = JSON.stringify({
      imports: {
        three: "https://unpkg.com/three@0.166.1/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.166.1/examples/jsm/"
      }
    });
    document.head.appendChild(importmap);

    // Load background script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'assets/js/background.js';
    document.body.appendChild(script);
  }

  // Load immediately when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBackground);
  } else {
    loadBackground();
  }
})();
