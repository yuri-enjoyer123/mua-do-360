# Mưa đỏ — Quảng Trị 1972: tour 360°

Approved brief: browser-first Vietnamese panorama tour for a book presentation, four stops (Thạch Hãn, moat, North Gate, citadel interior), quiet atmosphere, clearly labelled reconstruction with scene-specific historical sources and uncertainty notes. No invented historical events or attribution of fictional characters to real people. No modern monuments in 1972 reconstructions.

Implementation: Vite + TypeScript + Pannellum, local assets/fonts, mouse/touch/keyboard navigation, scene links, sources drawer, presentation/fullscreen modes, optional subdued ambience off by default, accessible image/WebGL failure state. No runtime API or paid backend. Source and interpretation content live in src/content.ts.

Validation: TypeScript/build, browser tests for desktop/mobile navigation, scene deep links, source labels, dialog keyboard behavior, texture/WebGL failure paths, full-sphere visual inspection. Initial transfer target under 5 MB.

Deployment: a public project repository with GitHub Actions verification and free GitHub Pages hosting.

## Progress

- Historical content and notes authored against the Cục Di sản, TTXVN, MTTQ and author interview sources.
- Four AI-assisted interpretive panoramas produced at their native resolution (1774 × 887), compressed as WebP with separate thumbnails. No upsampling.

## Public-content boundaries

Do not publish the private script URL, speaker names/class, full novel PDF, login artifacts, or any credentials. Source citations use public historical/author sources. Literary content remains expressly separated from historical claims.
