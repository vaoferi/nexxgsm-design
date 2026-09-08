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
