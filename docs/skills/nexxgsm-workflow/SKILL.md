---
name: nexxgsm-workflow
description: Release and browser-QA workflow for the NexxGSM/Bios Zone canonical landing.
---

# NexxGSM workflow

This repository is the source of truth for `versions/en-US-landing/`. Work in a
small, reviewable patch and explain the user-facing result before the technical
details.

## Release order

1. Read `AGENTS.md`, `PRODUCT.md`, `SPEC.md`, and the relevant architecture decision.
2. Inspect the current worktree. Preserve unrelated user changes.
3. Edit the canonical source only; do not patch a generated CF copy first.
4. Run syntax, diff, responsive, and browser checks against the NAS staging URL:
   `http://nlmhelp.keenetic.link:18080/`.
5. Verify the actual DOM, assets, console, navigation, anchor geometry, and
   horizontal overflow. HTTP 200 alone is not a pass.
6. Before a production release, sync the complete canonical surface (including
   newly added files and cache-busted asset URLs) to `vaoferi/biosunlocktool`.
7. Review the sync diff, commit with the repository identity, push `main`, wait
   for the Cloudflare Action, then smoke-test `https://biosunlocktool.com/`.

## Playtest traps

### A forgotten file in the canonical commit

The canonical landing is a directory, not only `index.html`. A CSS/JS/favicon,
asset, documentation, or test file added during a browser pass can be omitted
from a commit or from the CF sync and make staging differ from production.

- Compare `git status --short` and `git diff --stat` before committing.
- Check every `href`, `src`, `import()`, preload, favicon, canonical, and OG URL
  exists in the commit and in the synced CF tree.
- Compare the canonical directory with the CF root and `locales/en-US/` where
  the project policy requires byte identity.
- After deploy, fetch the real production asset and inspect its content marker;
  do not infer success from the HTML page status alone.

### Sticky header above anchors

The header is sticky and overlays the page. A native `#anchor` jump can place a
section heading underneath it, making navigation appear broken even though the
URL changed.

- Keep `[id] { scroll-margin-top: ... }` synchronized with the measured header
  bottom at desktop, tablet, and mobile widths.
- Test direct `#product`, `#how-it-works`, `#buy`, and `#guides` navigation with
  the mobile burger both closed and open.
- Verify the target heading is visible below the header after the browser's
  smooth-scroll settles; test keyboard activation as well as pointer clicks.

## UI regression matrix

At minimum check 320, 390, 480, 600, 768, 900, 1100, 1280, and 1440px:

- zero horizontal overflow;
- header/logo/burger readability and hit targets;
- hero geometry, glass contrast, figure weight, and CTA wrapping;
- product-card gutters and `data-pick → pay-row` selection state;
- guide accordion and post-guide CTA;
- reduced-motion behavior and console errors.

## Safe completion report

Record:

- what changed for the visitor;
- source files and cache stamps changed;
- staging browser evidence;
- production URL and Cloudflare run evidence, if deployed;
- checks that could not run and the remaining risk;
- any uncommitted or intentionally preserved work.

Do not print secrets, router credentials, cookies, full device codes, or private
customer data. Do not change NAS containers, Keenetic forwarding, payment
credentials, or production configuration as a substitute for fixing the page.
