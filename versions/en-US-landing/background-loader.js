/**
 * Background loader for Three.js shader
 * Loads Three.js with SRI integrity check and graceful fallback
 */
(function () {
  'use strict';

  var SRI = 'sha384-AGb1dmc6iKzaUdiKzoPrjurf+KS2wBFi+pjOpaJcgaw+7KKLb6xukClmpc64hKhg';
  var CDN_BASE = 'https://unpkg.com/three@0.166.1';

  function showFallback() {
    var fb = document.getElementById('bg-fallback');
    if (fb) {
      fb.style.display = 'block';
      fb.style.opacity = '1';
    }
  }

  function onThreeLoad() {
    var script = document.createElement('script');
    script.type = 'module';
    script.src = 'assets/js/background.js';
    script.onerror = showFallback;
    document.body.appendChild(script);
  }

  function loadThree() {
    // Add importmap
    var importmap = document.createElement('script');
    importmap.type = 'importmap';
    importmap.textContent = JSON.stringify({
      imports: {
        three: CDN_BASE + '/build/three.module.js',
        'three/addons/': CDN_BASE + '/examples/jsm/'
      }
    });
    document.head.appendChild(importmap);

    // Load Three.js with SRI
    var threeScript = document.createElement('script');
    threeScript.src = CDN_BASE + '/build/three.module.js';
    threeScript.crossOrigin = 'anonymous';
    threeScript.integrity = SRI;
    threeScript.onload = onThreeLoad;
    threeScript.onerror = showFallback;
    document.head.appendChild(threeScript);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadThree);
  } else {
    loadThree();
  }
})();
