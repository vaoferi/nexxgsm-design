# Animation recipes

## IntersectionObserver fallback

```js
const items = document.querySelectorAll('.reveal-on-scroll');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduce || !('IntersectionObserver' in window)) {
  items.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, current) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      current.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach((item) => observer.observe(item));
}
```

The CSS must leave the content visible when the script is absent. If CSS
Scroll-Driven Animations are supported, the observer can be skipped so the
timeline also reverses during upward scrolling.

## Focus-safe SVG

```html
<button class="icon-button" aria-label="Open menu">
  <svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">
    <g class="menu-lines">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
  </svg>
</button>
```

```css
.menu-lines { stroke: currentColor; stroke-width: 2; fill: none; transition: transform .2s ease; }
.icon-button:hover .menu-lines,
.icon-button:focus-visible .menu-lines { transform: translateY(-1px); }
```

Keep the button action available without the animation. Respect reduced motion
by removing the transition.
