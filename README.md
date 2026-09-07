# NexxGSM Design Alternatives

Alternative culturally-adapted versions of `nexxgsm.com/blog/dell-bios-password-types` for Indian and American audiences.

## Structure

```
/
├── versions/
│   ├── en-US/    # American English version
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── img/
│   │   └── README.md
│   │
│   └── en-IN/    # Indian English version
│       ├── index.html
│       ├── assets/
│       │   ├── css/
│       │   ├── js/
│       │   └── img/
│       └── README.md
│
├── testing/              # Responsive regression tests
│   ├── backstop.json
│   ├── playwright.config.js
│   └── viewports.js
│
└── shared/               # Shared resources between versions
    ├── keywords-research.md
    └── wireframes/
```

## Versions

| Version | Audience | Language | Cultural Adaptation |
|---------|----------|----------|---------------------|
| en-US | United States | American English | Minimalist, direct, expertise-focused, white space, quick loading |
| en-IN | India | Indian English | Colorful, detailed, social proof, mobile-first, Hindi loanwords |

## Testing

```bash
# Run visual regression tests
cd testing
npm install
npx backstop test        # Pixel-perfect regression
node test-responsive.js  # 1,000,000 viewport sizes
```
