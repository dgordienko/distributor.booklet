---
version: "alpha"
name: "Platform Capabilities"
description: "Platform Capabilities Pricing Section is designed for comparing plans and supporting conversion decisions. Key features include plan comparison blocks and conversion-oriented actions. It is suitable for subscription pricing pages and plan comparison experiences."
colors:
  primary: "#93C5FD"
  secondary: "#3B82F6"
  tertiary: "#B29BFF"
  neutral: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#93C5FD"
  text-primary: "#FFFFFF"
  text-secondary: "#FFFFFF"
  border: "#FFFFFF"
  accent: "#93C5FD"
typography:
  headline-lg:
    fontFamily: "Inter"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: "40px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 200
    lineHeight: "22.4px"
  label-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
rounded:
  md: "0px"
  full: "9999px"
spacing:
  base: "4px"
  sm: "1px"
  md: "4px"
  lg: "6px"
  xl: "8px"
  gap: "2px"
  card-padding: "9px"
  section-padding: "32px"
components:
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "10px"
  button-link:
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "0px"
  card:
    rounded: "16px"
    padding: "16px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Bounded
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses dark mode with #93C5FD as the main accent and #FFFFFF as the neutral foundation.

- **Primary (#93C5FD):** Main accent and emphasis color.
- **Secondary (#3B82F6):** Supporting accent for secondary emphasis.
- **Tertiary (#B29BFF):** Reserved accent for supporting contrast moments.
- **Neutral (#FFFFFF):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #93C5FD; Text Primary: #FFFFFF; Text Secondary: #FFFFFF; Border: #FFFFFF; Accent: #93C5FD

- **Gradients:** bg-gradient-to-t from-white to-white/30, bg-gradient-to-b from-white/5 to-transparent, bg-gradient-to-b from-[#0a2342] to-[#4682b4] via-[#1a4b82], bg-gradient-to-b from-white/40 to-white/10

## Typography

Typography relies on Inter across display, body, and utility text.

- **Headlines (`headline-lg`):** Inter, 36px, weight 500, line-height 40px, letter-spacing -0.025em.
- **Body (`body-md`):** Inter, 14px, weight 200, line-height 22.4px.
- **Labels (`label-md`):** Inter, 14px, weight 400, line-height 20px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, bounded structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / bounded composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Bounded
- **Base unit:** 4px
- **Scale:** 1px, 4px, 6px, 8px, 10px, 12px, 16px, 20px
- **Section padding:** 32px
- **Card padding:** 9px, 10px, 16px, 32px
- **Gaps:** 2px, 6px, 8px, 12px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 1px #FFFFFF; 2px #FFFFFF
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 24px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.05) 0px 4px 12px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.02) 0px 2px 10px 0px
- **Blur:** 12px, 4px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 6px padding and a 24px radius. Drive the shell with none so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 4px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 4px, 12px, 16px, 20px, 24px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Secondary:** background #FFFFFF, text #FFFFFF, radius 9999px, padding 10px, border 0px solid rgb(229, 231, 235).
- **Links:** text #FFFFFF, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** background rgba(255, 255, 255, 0.1), border 1px solid rgba(255, 255, 255, 0.2), radius 16px, padding 16px, shadow none, blur 12px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 4px, 12px, 16px, 20px, 24px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected expressive motion intensity without a deliberate reason.

## Motion

Motion feels expressive but remains focused on interface, text, and layout transitions. Timing clusters around 500ms and 150ms. Easing favors ease and 0. Hover behavior focuses on color and text changes.

**Motion Level:** expressive

**Durations:** 500ms, 150ms, 300ms, 2000ms, 3000ms

**Easings:** ease, 0, 1), cubic-bezier(0.4, 0.2, 0.6

**Hover Patterns:** color, text, shadow, transform
