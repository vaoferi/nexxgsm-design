# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing static HTML/CSS/JavaScript landing; local Three.js module for the wide-screen hero scene.

## Users

- People who are locked out of a Dell laptop by a System, Admin/Setup, or supported BIOS password prompt.
- Buyers who need a clear path to a reset code, removal tool, or recovery-service request.
- Owners, resellers, and IT/support people who need to distinguish a BIOS password from a Windows, BitLocker, or drive password.

## Product Purpose

BIOS ZONE explains the Dell BIOS-password problem, helps a visitor identify the correct recovery path, and converts that visitor into a purchase or a private Telegram conversation. The canonical English landing is the source surface for future localized copies.

## Positioning

The landing combines a short product choice, Dell-specific password triage, and an immediate Telegram handoff. It does not promise that every Dell or every password type is recoverable; the guides explicitly preserve model- and lockout-dependent limits.

## Operating Context

- Canonical source: `versions/en-US-landing/` in this repository.
- Staging/test surface: `http://nlmhelp.keenetic.link:18080/`, served from the Synology bind mount. Short market hosts are also available on the same port: `us.`, `ca.`, `in.`, `de.`, `pl.`, `af.` + `nlmhelp.keenetic.link`; `in`, `pl` and `de` enable the India, Poland and Germany atmospheres for the shared canonical copy.
- Production surface: `https://biosunlocktool.com/` on Cloudflare Pages; the NAS staging surface must be checked before a production release.
- The workflow is static-file editing → NAS browser verification → canonical sync to `vaoferi/biosunlocktool` → Cloudflare build/deploy → production smoke test.

## Capabilities and Constraints

- Product choices: Reset Tool ($28.20), Remove Tool ($17.45), and Recovery Service ($49.99).
- Product cards use `data-pick` and must visibly synchronize the chosen product with the buy/payment area.
- Telegram is the available live handoff; the PayPal button currently exposes an inline “coming soon” state rather than pretending checkout is live.
- Eight Dell BIOS guides and FAQPage structured data explain password types, code suffixes, privacy, and recovery limits.
- Polish production preserves the same information architecture and product promises while translating the primary conversion UI; its background is intentionally a separate cultural experiment, not a literal flag treatment.
- German production preserves the same information architecture and product promises while translating the primary conversion UI; its background uses a distinct engineering-blueprint direction rather than a literal flag treatment.
- Desktop/wide screens may use a transparent Three.js monitor-and-keyboard scene; mobile must retain a visual effect without depending on WebGL.
- No secrets, customer identifiers, full device codes, or invented testimonials may be added to the public page.
- Static content is edited in files; there is no admin-to-frontend CMS data flow in this project.

## Brand Commitments

- Product/brand names: BIOS ZONE and NexxGSM Service Point S.R.L.
- Canonical language: American English (`en-US`); future copies adapt copy, currency, contact channel, and tone without silently changing the canonical product truth.
- User-approved canonical design decisions: one continuous animated deep-navy page background (`#0b2e55 → #071d39 → #01050d`, inspired by the dark blue field of the American flag); matte glass surfaces for header, hero copy, cards, CTA, guides, and footer; the monitor-with-code mark in the header/favicon; the 8FC8 hero figures; and the desktop monitor scene.
- The hero PC starts about `3rem` to the right of the hero-copy frame, moves right on page scroll, returns on reverse scroll, and is kept approximately 7% smaller than the earlier wide composition.
- Hero copy remains readable on the animated background through the same translucent treatment as the Telegram button; the PC itself is not darkened when the page background is adjusted.
- The 8 figures use a restrained breathing range around 15%→20%; motion must stop under `prefers-reduced-motion`.
- Header anchors reserve space for the sticky header; all main blocks share the page gutter across breakpoint reflows.

## Evidence on Hand

- Canonical source and user-approved browser feedback are in `versions/en-US-landing/` and the project history.
- `versions/en-US-landing/og-cover.jpg` is available for sharing previews.
- The page currently presents “Trusted by 2,500+ customers”; independent testimonial/rating evidence is not present and must not be fabricated.
- The PayPal integration is not live yet; this is represented explicitly in the UI.

## Product Principles

1. Tell the visitor which password problem they have before asking them to pay.
2. Preserve privacy: full device codes and identifiers belong only in private support flows.
3. Keep the purchase path short, explicit, and honest about unavailable integrations.
4. Make the same canonical truth work at mobile, tablet, desktop, and wide desktop widths.
5. Test the real NAS-served page before syncing or deploying production.

## Accessibility & Inclusion

- Preserve keyboard focus visibility, semantic headings/links/buttons, accessible labels, and reduced-motion behavior.
- Maintain readable text and controls at 320–480px with the burger menu open over the background.
- Do not rely on color alone for product selection; the selected tariff needs a visible state and accessible status.
- Keep guides and password-type distinctions understandable without requiring visual inspection of the hero effect.
