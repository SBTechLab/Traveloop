---
name: Traveloop Dark
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#e0c0b1'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#a78b7d'
  outline-variant: '#584237'
  surface-tint: '#ffb690'
  primary: '#ffb690'
  on-primary: '#552100'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#9d4300'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#929ab2'
  on-tertiary-container: '#2a3246'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system embodies a premium, nocturnal travel experience. It is designed for the modern explorer who seeks adventure after dusk or plans their next journey in the quiet hours of the night. The aesthetic is "Midnight Modern"—a blend of corporate reliability and high-end editorial flair. 

The style utilizes a **Glassmorphic** and **Minimalist** hybrid. It avoids heavy, muddy shadows in favor of luminosity and structural clarity. Surfaces feel like polished obsidian or dark glass, with accents cutting through the darkness like the glow of a cockpit or city lights at night. The emotional response is one of calm, competence, and sophisticated wanderlust.

## Colors

The palette is anchored in deep oceanic tones to provide a restful viewing experience. 

- **Surfaces:** We use `#0f172a` (Deep Navy) for the primary canvas. Secondary containers and cards utilize `#1e293b` (Charcoal) to create subtle tonal separation.
- **Accents:** Sunset Orange (`#f97316`) serves as the high-energy primary action color, providing a warm, inviting glow. Soft Indigo (`#6366f1`) acts as a secondary accent for supportive information, tags, and progress indicators.
- **Contrast:** Typography is strictly high-contrast. Use white for primary headings and light gray tones for secondary body text to ensure WCAG AA compliance against the dark backgrounds.

## Typography

This design system leverages a sophisticated serif/sans-serif pairing. 

- **Headlines:** Noto Serif provides a timeless, editorial feel. It should be used for large hero sections, article titles, and major card headers.
- **Body & UI:** Plus Jakarta Sans is used for all functional text, body copy, and navigation labels. Its wide apertures and modern geometric shapes maintain high legibility on dark, backlit screens.
- **Hierarchy:** Use heavier weights for headlines to anchor the page. For body text, maintain a 1.6 line height to prevent the "vibration" effect often seen with white text on dark backgrounds.

## Layout & Spacing

The layout follows a strict **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Rhythm:** An 8px base unit (the "Step") governs all spacing. 
- **Desktop:** Use 24px gutters with 48px page margins.
- **Mobile:** Margins shrink to 16px to maximize real estate for imagery and content.
- **Alignment:** Content should be grouped in logical clusters using `md` (24px) spacing, while distinct sections should be separated by `xl` (80px) to give the sophisticated typography room to breathe.

## Elevation & Depth

In this dark mode environment, depth is communicated through luminosity and borders rather than shadow casting.

- **Tonal Layering:** Objects "closer" to the user are lighter in color (`#334155`) than the base background. 
- **Subtle Borders:** Use 1px borders with low-opacity white (e.g., `rgba(255, 255, 255, 0.1)`) to define element boundaries.
- **Inner Glows:** For primary buttons and active states, apply a very subtle 2px inner glow or outer blur in the primary accent color (`#f97316`) to simulate a neon-like radiance.
- **Backdrop Blur:** Use a 12px-20px blur on fixed navigation bars and overlays to maintain context while ensuring legibility.

## Shapes

The shape language is contemporary and approachable. A `ROUND_EIGHT` (0.5rem) standard is applied to all primary UI elements.

- **Standard Elements:** Buttons, input fields, and small cards use the base 0.5rem (8px) radius.
- **Large Containers:** Image carousels and section containers should use `rounded-xl` (1.5rem) to soften the overall visual footprint.
- **Interactive States:** When hovered, elements should not change their border-radius, but may increase their border-opacity to emphasize interaction.

## Components

- **Buttons:** 
    - *Primary:* Solid `#f97316` with white text. Apply a subtle 4px orange glow on hover.
    - *Secondary:* Ghost style with a 1px Indigo (`#6366f1`) border and Indigo text.
- **Cards:** Use the Charcoal surface (`#1e293b`) with a 1px border. Headlines inside cards should remain Noto Serif.
- **Input Fields:** Deep background (`#0f172a`) with a 1px charcoal border. The label sits above the field in Plus Jakarta Sans (Label-sm).
- **Chips/Badges:** Small, high-contrast pills. Use Indigo backgrounds with 20% opacity and solid Indigo text for "Status" or "Category" indicators.
- **Lists:** Separate list items with a 1px divider in `#1e293b`. Use 16px vertical padding for touch-friendly targets.
- **Progress Bars:** Use a charcoal track with a Sunset Orange fill, including a small glow at the leading edge of the progress.