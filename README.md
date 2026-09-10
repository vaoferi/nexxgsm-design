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
│           └── js/           # bg-scene-c.js — wide 3D hero; CSS gradient serves mobile
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
├── docs/skills/              # Portable workflow and animation skills
│   └── web-animation-patterns/ # CSS timelines + IO fallback + a11y rules
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

# Page-gutter regression (requires the same :8080 server)
node layout-gutter.js
```

## Dev preview

Serve `versions/` and open the landing (the importmap resolves `three` from CDN):

```bash
cd versions && python3 -m http.server 8080
# → http://localhost:8080/en-US-landing/
```

## Production

**Live since 2026-09-09:** production runs on **Cloudflare Pages** at **https://biosunlocktool.com/** (www included) — monorepo `vaoferi/biosunlocktool`. Market hosts use short codes: `us`/`ca`/`in` serve the canonical English landing (`in` adds the India atmosphere), while `de`/`pl`/`af` map to their locale folders; `pl` serves the Polish graphite/carmine experiment, `de` the German steel/amber experiment, and `af` the Africa English indigo/terracotta experiment.

**Surface priority (user decision 2026-09-09):** test everything on the NAS staging surface first; only verified changes get deployed to production (sync canonical → push → green Action).

Full rationale: `docs/architecture-decisions.md`.

## Production (remote NAS — test/staging surface)

The canonical landing runs as a Docker container on the Synology NAS (DS720+, host `NAS`), served by `nginx:1.27-alpine` on **port 18080** and published to the internet through the outer Keenetic (`nlm.help`, Peak KN-2710) port forward:

> **http://nlmhelp.keenetic.link:18080/**

The staging DNS is wildcarded, so the same port is available with the same short market codes:
`http://us.nlmhelp.keenetic.link:18080/`, `http://ca.nlmhelp.keenetic.link:18080/`,
`http://in.nlmhelp.keenetic.link:18080/`, `http://de.nlmhelp.keenetic.link:18080/`,
`http://pl.nlmhelp.keenetic.link:18080/`, and `http://af.nlmhelp.keenetic.link:18080/`.
The staging landing reads the hostname client-side; `in` gets the India theme, `pl` gets the Poland atmosphere, `de` gets the Germany atmosphere, and `af` gets the Africa experiment. The staging bind-mount still serves the canonical English copy; localized Polish/German/Africa copies are routed by Cloudflare Pages to `/locales/pl-PL/`, `/locales/de-DE/`, and `/locales/af-ZA/`.

- **Content source of truth:** the NAS folder `/volume1/homes/vaoferi/Work/8fc8/nexxgsm-design/versions/en-US-landing/` — the same folder mounted on this workstation as `/Volumes/Work/8fc8`. Editing files here deploys to staging instantly (nginx bind-mounts the folder read-only, no rebuild or copy step). Use this surface to verify every change **before** releasing to production — it is not a backup to tear down, it is the pre-release test bench.
- **Container:** `nexxgsm-landing` (`docker run -d --name nexxgsm-landing --restart unless-stopped -p 18080:80 -v <folder>:/usr/share/nginx/html:ro nginx:1.27-alpine`), managed via SSH (`vaoferi@176.97.56.70 -p 2222`, docker needs `sudo` on Synology).
- **Router forward:** outer Keenetic RCI `ip static`: `GigabitEthernet1 tcp 18080 → MAC 90:09:d0:06:1c:92` (NAS), comment `nexxgsm-landing`; config saved (`system configuration save`). Public IP `176.97.56.70` via DDNS name `nlmhelp.keenetic.link`.
- **Port convention:** `180xx` = public static sites on this NAS. Taken: 18080 (this site), 18085, 18090, 18091. **Do not reuse; pick the next free 180xx** for future language copies.
- **Pre-deploy check:** changes are visible at the public URL immediately after saving the file — verify HTTP 200 + spot-check content, not just the local preview.
