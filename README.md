# NexxGSM Design

Design workspace for **NexxGSM Service Point S.R.L.** — the "BIOS ZONE" landing page (Dell BIOS password unlock tools & recovery service), plus shared research and visual regression testing.

## Canonical version

**`versions/en-US-landing/`** is the single canonical version — the one we iterate on and perfect.

Future language/culture copies (e.g. `en-IN-landing`, `ro-RO-landing`, ...) will be **created from it** once the canonical version is finalized, each keeping the structure but adapting copy, currency, contact channels and tone per audience.

## Structure

```
/
├── versions/
│   └── en-US-landing/        # CANONICAL landing (American English)
│       ├── index.html
│       └── assets/
│           ├── css/          # main.css — layout, accordion, FAQ, dark theme
│           └── js/           # background.js — Three.js WebGL hero
│
├── testing/                  # Visual regression tests
│   ├── backstop.json         # BackstopJS scenarios
│   ├── quick-test.js         # Fast overflow check (serves versions/ on :8080)
│   ├── test-responsive.js    # Full responsive sweep
│   └── viewports reference in backstop.json
│
├── shared/                   # Shared resources between versions
│   ├── keywords-research.md  # SEO research + cultural adaptation guidelines
│   └── wireframes/
│
├── AGENTS.md                 # Agent operating rules (workspace-wide)
└── README.md
```

## Cultural adaptation guidelines

See `shared/keywords-research.md`. Summary for future copies:

| Aspect | en-US (canonical) | Example: en-IN copy |
|---|---|---|
| Tone | Minimalist, technical, enterprise | Denser, urgency-driven, Hinglish |
| Currency | USD ($28.20 / $17.45 / $49.99) | INR (₹2,350 / ₹1,450 / ₹4,150) |
| Contact | tel:, Telegram | WhatsApp deep-links, "Call Now" |
| Trust | Certifications, enterprise badges | ⭐ ratings, testimonials, city lists |

## Testing

```bash
# Visual regression (pixel-perfect)
cd testing
npm install
npx backstop test

# Responsive overflow sweep (requires: python3 -m http.server 8080 from versions/)
node quick-test.js

# Full responsive audit (opens local files directly)
node test-responsive.js
```

## Dev preview

Serve `versions/` and open the landing (the importmap resolves `three` from CDN):

```bash
cd versions && python3 -m http.server 8080
# → http://localhost:8080/en-US-landing/
```

## Production

**Platform decision (2026-09-09):** production is moving to **Cloudflare Pages** under the brand domain **https://biosunlocktool.com/** — monorepo `vaoferi/biosunlocktool` with i18n versions, routed by subdomains (us → en-US, in → en-IN, de → de-DE, pl → pl-PL, af → af-ZA). Free plan: Universal SSL built in, 500 builds/day, 100 GB bandwidth. Full rationale: `docs/architecture-decisions.md`.

The NAS setup below stays as **staging/backup** until the Cloudflare deployment takes traffic — do not tear it down.

## Production (remote NAS — staging)

The canonical landing runs as a Docker container on the Synology NAS (DS720+, host `NAS`), served by `nginx:1.27-alpine` on **port 18080** and published to the internet through the outer Keenetic (`nlm.help`, Peak KN-2710) port forward:

> **http://nlmhelp.keenetic.link:18080/**

- **Content source of truth:** the NAS folder `/volume1/homes/vaoferi/Work/8fc8/nexxgsm-design/versions/en-US-landing/` — the same folder mounted on this workstation as `/Volumes/Work/8fc8`. Editing files here **is** the deploy: nginx bind-mounts the folder read-only, no rebuild or copy step.
- **Container:** `nexxgsm-landing` (`docker run -d --name nexxgsm-landing --restart unless-stopped -p 18080:80 -v <folder>:/usr/share/nginx/html:ro nginx:1.27-alpine`), managed via SSH (`vaoferi@176.97.56.70 -p 2222`, docker needs `sudo` on Synology).
- **Router forward:** outer Keenetic RCI `ip static`: `GigabitEthernet1 tcp 18080 → MAC 90:09:d0:06:1c:92` (NAS), comment `nexxgsm-landing`; config saved (`system configuration save`). Public IP `176.97.56.70` via DDNS name `nlmhelp.keenetic.link`.
- **Port convention:** `180xx` = public static sites on this NAS. Taken: 18080 (this site), 18085, 18090, 18091. **Do not reuse; pick the next free 180xx** for future language copies.
- **Pre-deploy check:** changes are visible at the public URL immediately after saving the file — verify HTTP 200 + spot-check content, not just the local preview.
