---
name: Explorer-Modern
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#400010'
  on-tertiary-container: '#da586c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md-mobile:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.5'
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
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
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
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 20px
---

## Brand & Style

This design system embodies the "Explorer-Modern" aesthetic, a balance between high-utility planning and the romantic allure of travel. The brand personality is professional yet adventurous—positioning itself as a reliable co-pilot for complex itineraries while maintaining a sense of wonder through editorial-grade visuals.

The design style leverages **Minimalism** to ensure clarity during information-heavy planning, mixed with **Soft Tactility** (subtle shadows and depth) to make the interface feel tangible and premium. The UI should evoke a sense of calm organization, using ample whitespace to prevent "travel fatigue" during long planning sessions.

## Colors

The color strategy uses high-contrast anchoring to guide the user's eye. 

- **Primary (Midnight Blue):** Represents trust and stability. It is used for core navigation, primary text, and structural elements to keep the interface grounded.
- **Secondary (Venturer Orange):** An energetic accent used for primary actions, progress indicators, and "active" discovery states. It provides high visibility against the deep blues.
- **Tertiary (Sunset Coral):** A softer accent used for secondary highlights, favoriting items, or indicating "inspiration" zones within the UI.
- **Neutral (Cloud White & Slate):** A palette of cool greys and off-whites provides the canvas. Backgrounds should use subtle shifts in neutral tones to define content blocks without the need for heavy borders.

## Typography

The typography pairing creates a distinction between "Dreaming" and "Doing."

- **Headlines (Noto Serif):** Used for destination names, section headers, and storytelling elements. This adds a sophisticated, editorial feel reminiscent of high-end travel journals.
- **Functional UI (Plus Jakarta Sans):** A modern, soft sans-serif used for all interactive elements, body copy, and data-heavy tables. Its high x-height and open apertures ensure readability when users are scanning complex flight or hotel details.
- **Hierarchy:** Use bold weights and the Primary Blue for titles. Secondary Orange should be reserved for links or specific Label-SM tags that require immediate attention.

## Layout & Spacing

This design system utilizes a **Fixed Grid** for desktop to maintain a premium, structured feel, transitioning to a **Fluid Grid** for mobile devices.

- **Grid:** A 12-column system is used for desktop. Content blocks (like itinerary cards or map sidebars) should align to these columns to maintain a crisp visual rhythm.
- **Vertical Rhythm:** Spacing is strictly based on 8px increments. Use larger gaps (64px+) between major sections (e.g., "Top Destinations" and "Your Recent Plans") to emphasize the sense of whitespace and professional organization.
- **Mobile Reflow:** On mobile, side-by-side cards (like hotel listings) should stack vertically, while horizontal scrolling carousels are preferred for "Inspiration" categories to save vertical space.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows** and **Tonal Layering**.

- **Surfaces:** The primary background is the neutral "Cloud White." Elements that require focus, such as active itinerary items or modal windows, sit on "Level 1" elevation.
- **Shadows:** Use extremely diffused, low-opacity shadows (Blur: 20px, Y: 4px, Opacity: 6%) with a slight blue tint (#0F172A) to make elements appear as if they are floating softly above the page rather than being "stuck" to it.
- **Depth Cues:** Background blurs (Glassmorphism) should be used sparingly for sticky navigation bars to maintain context of the content scrolling underneath, reinforcing the "modern" feel.

## Shapes

The shape language is approachable yet disciplined. 

- **Standard Radius:** 8px is the default for input fields, buttons, and small UI components.
- **Container Radius:** 16px (Large) is used for cards and major content sections to give them a distinct, softer "object" feel.
- **Interactive States:** Buttons should never be fully sharp; they must maintain the rounded aesthetic to feel "inviting."
- **Imagery:** Photos should always follow the 12px or 16px corner radius to harmonize with the container shapes.

## Components

- **Buttons:** Primary buttons use a solid Secondary Orange background with white text. Secondary buttons use a Primary Blue outline with a transparent background. 
- **Cards:** Travel cards should feature high-quality imagery with a gradient overlay at the bottom for white text legibility. Cards should have a subtle 1px border (#E2E8F0) and an ambient shadow on hover.
- **Chips/Tags:** Used for categories like "Adventure," "Family-Friendly," or "Budget." These use a light tint of the primary color with dark text for high contrast without being heavy.
- **Inputs:** Clean, 8px rounded fields with a 1px Slate border. On focus, the border should transition to Primary Blue with a soft outer glow.
- **Itinerary Timeline:** A vertical line component using the Secondary Orange for "completed" milestones and a dashed Slate line for "upcoming" plans. This provides the "highly organized" feel requested.
- **Imagery:** Use full-width "Hero" sections with rich, saturated photography to inspire wanderlust immediately upon entry.