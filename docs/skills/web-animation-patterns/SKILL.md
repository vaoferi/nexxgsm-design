---
name: web-animation-patterns
description: Build and review production web animations. Use whenever a user asks to animate a landing page, make sections appear on scroll, add scroll progress, parallax, hover/SVG motion, staggered cards, carousels, or interactive visual effects. Prefer native CSS Scroll-Driven Animations with progressive fallbacks, IntersectionObserver for compatibility, and accessible reduced-motion behavior.
compatibility: Requires a browser-capable HTML/CSS/JS project. No animation library is required; optional browser tooling may be used for verification.
---

# Web animation patterns

Use this skill to add motion that clarifies hierarchy and interaction without
turning scrolling into a performance problem. Start from the existing visual
language, content, and layout; animation is a layer over a usable static page,
not a replacement for it.

## Operating sequence

1. Read the project rules and inspect the existing DOM, CSS tokens, breakpoints,
   and current motion. Identify the element, user intent, and the point where
   motion should start and finish.
2. Define a static, fully readable baseline first. Do not hide content merely
   because a browser lacks a timeline API or JavaScript.
3. Choose the smallest native mechanism that fits:
   - `animation-timeline: scroll(root)` for page progress or a global scroll
     relationship;
   - `animation-timeline: view()` plus `animation-range` for an element entering
     or leaving the viewport;
   - `IntersectionObserver` when a class/state change or wider browser support is
     required;
   - CSS transitions for hover, focus, open/closed, and selected states;
   - inline SVG groups for icon/illustration details that must be styled.
4. Gate motion behind `prefers-reduced-motion: no-preference`. Reduced-motion
   users receive the final readable state, with no blur, parallax, rotation, or
   scroll progress movement.
5. Add progressive enhancement. Use `@supports (animation-timeline: view())`
   or `@supports (animation-timeline: scroll())`; keep the static state as the
   fallback. If JavaScript is needed, use a passive observer and do not bind a
   per-pixel `scroll` handler unless there is no native alternative.
6. Verify the real page at representative mobile, tablet, desktop, and wide
   widths. Check reverse scrolling, keyboard focus, touch interaction, console
   errors, overflow, and reduced-motion mode.

## Motion contract

Every new animation must document these decisions in a code comment or nearby
design note:

- **Trigger:** page scroll, viewport entry/exit, hover/focus, click, or state;
- **Range:** `entry`, `exit`, `cover`, `contain`, or an explicit pixel/percent
  range;
- **Property budget:** prefer `transform` and `opacity`; use blur, clip-path,
  and shadow sparingly because they can increase GPU work;
- **Reversal:** scroll-driven effects must naturally reverse when scrolling back;
- **End state:** use `both`/`forwards` only when the element should retain its
  final state; do not leave a hidden element if the API is unsupported;
- **Accessibility:** what reduced-motion users see and how keyboard users reach
  the same content;
- **Fallback:** static CSS or an IntersectionObserver equivalent.

## Canonical recipes

### Page progress

```css
.scroll-progress {
  position: fixed;
  inset: 0 0 auto;
  height: 3px;
  transform: scaleX(0);
  transform-origin: left center;
  pointer-events: none;
  z-index: 1000;
}

@supports (animation-timeline: scroll()) {
  .scroll-progress {
    animation: progress linear both;
    animation-timeline: scroll(root);
  }
}

@keyframes progress {
  to { transform: scaleX(1); }
}
```

Hide the optional indicator, or leave a static non-moving accent, when the
browser does not support a timeline. It must never create layout space.

### Viewport reveal

```css
.reveal-on-scroll {
  opacity: 1;
  transform: none;
}

@supports (animation-timeline: view()) {
  .reveal-on-scroll {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 35%;
  }
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(20px) scale(.98); }
  to { opacity: 1; transform: none; }
}
```

If older browsers need the same effect, add a class with
`IntersectionObserver` and make the default state visible when JavaScript is
disabled. Observe once and unobserve after the first reveal unless repeat-on-
scroll is a deliberate requirement.

### Staggering

Prefer a small CSS delay or custom property (`--motion-order`) for a short list.
Keep the total cascade under roughly 400ms; a visitor should not wait for a
product card to become usable.

### SVG interaction

Use inline SVG and semantic `<g>` groups when internal paths need animation.
Use `currentColor` or CSS variables rather than hard-coded path colors. Put
`:hover`/`:focus-visible` on the stable SVG container, not on a moving path, so
the pointer does not chase its own target. Ensure the icon still communicates
its action without color or motion.

### Carousels and looping motion

Only add an infinite carousel when the content genuinely benefits from a moving
rail. Duplicate the group with `aria-hidden="true"`, keep item widths stable,
and calculate the translation from the duplicated group's exact width. Pause on
hover/focus and disable it for reduced motion. Do not introduce a horizontal
touch rail to a page whose actual requirement is vertical reading.

## Browser compatibility

CSS scroll timelines are progressive enhancement. Chromium support is strong,
but Safari/Firefox versions may differ. Do not ship a polyfill by reflex: first
decide whether the effect is valuable enough to justify its weight. The page
must remain usable with CSS timelines disabled, JavaScript disabled, WebGL
disabled, and reduced motion enabled.

## Performance and safety

- Never do expensive layout reads and writes in the same high-frequency scroll
  callback. Prefer timelines or IntersectionObserver.
- Animate `transform`/`opacity`; avoid animating width, height, top, left, or
  box-shadow on large lists.
- Reserve dimensions for animated media so reveal effects do not cause CLS.
- Stop or pause 3D/render-loop work when its section is off-screen or when the
  device is a compact/mobile viewport.
- Keep blur radius and simultaneous animated element count modest.
- Do not animate security, payment, or error messages in a way that delays their
  availability.

## QA checklist

- Static content is visible if timelines, JavaScript, or WebGL are unavailable.
- `prefers-reduced-motion: reduce` removes movement and blur while retaining
  the final readable state.
- Scroll down and back up: scroll-driven motion reverses smoothly.
- Hover and keyboard focus have equivalent feedback; touch has no hover-only
  dependency.
- No horizontal overflow at 320, 390, 768, 1280, and 1440px.
- No console errors, layout jumps, or click/anchor obstruction from sticky UI.
- Check LCP/CLS after adding large effects and compare a slow network sample.

## Report format

When finishing an animation pass, report:

1. Visitor-visible motion and its trigger/range.
2. Static and reduced-motion fallback.
3. Browser verification and measured performance.
4. Files changed and any remaining compatibility risk.
