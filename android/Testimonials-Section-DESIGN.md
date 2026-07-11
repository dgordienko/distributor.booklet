---
version: "alpha"
name: "Testimonials Section"
description: "Testimonials Impact Testimonial Section is designed for showcasing social proof and customer credibility. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#38BDF8"
  secondary: "#1E293B"
  tertiary: "#0F172A"
  neutral: "#FFFFFF"
  background: "#38BDF8"
  surface: "#1E293B"
  text-primary: "#FFFFFF"
  text-secondary: "#E2E8F0"
  accent: "#38BDF8"
typography:
  display-lg:
    fontFamily: "System Font"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: "60px"
    letterSpacing: "-0.05em"
    textTransform: "uppercase"
  body-md:
    fontFamily: "System Font"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "22.75px"
  label-md:
    fontFamily: "System Font"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
rounded:
  full: "9999px"
spacing:
  base: "12px"
  sm: "12px"
  md: "14px"
  lg: "16px"
  xl: "24px"
  gap: "8px"
  card-padding: "28px"
  section-padding: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "14px"
  card:
    backgroundColor: "{colors.secondary}"
    rounded: "16px"
    padding: "28px"
---

## Overview

- **Composition cues:**
  - Layout: Flex
  - Content Width: Bounded
  - Framing: Open
  - Grid: Minimal

## Colors

The color system uses dark mode with #38BDF8 as the main accent and #FFFFFF as the neutral foundation.

- **Primary (#38BDF8):** Main accent and emphasis color.
- **Secondary (#1E293B):** Supporting accent for secondary emphasis.
- **Tertiary (#0F172A):** Reserved accent for supporting contrast moments.
- **Neutral (#FFFFFF):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #38BDF8; Surface: #1E293B; Text Primary: #FFFFFF; Text Secondary: #E2E8F0; Accent: #38BDF8

## Typography

Typography relies on System Font across display, body, and utility text.

- **Display (`display-lg`):** System Font, 60px, weight 700, line-height 60px, letter-spacing -0.05em, uppercase.
- **Body (`body-md`):** System Font, 14px, weight 500, line-height 22.75px.
- **Labels (`label-md`):** System Font, 14px, weight 600, line-height 20px.

## Layout

Layout follows a flex composition with reusable spacing tokens. Preserve the flex, bounded structural frame before changing ornament or component styling. Use 12px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a flex / bounded composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Flex
- **Content width:** Bounded
- **Base unit:** 12px
- **Scale:** 12px, 14px, 16px, 24px, 28px, 40px, 48px, 80px
- **Section padding:** 28px, 32px, 80px
- **Card padding:** 28px
- **Gaps:** 8px, 12px, 32px

## Elevation & Depth

Depth is communicated through elevated, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as elevated first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Elevated
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 0px padding and a 0px radius. Drive the shell with none so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 16px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 16px, 24px, 9999px
- **Icon treatment:** Duotone
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #38BDF8, text #0F172A, radius 9999px, padding 14px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** background #1E293B, border 0px solid rgb(229, 231, 235), radius 16px, padding 28px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px.
- **Card surface:** background #334155, border 0px solid rgb(229, 231, 235), radius 16px, padding 28px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px.
- **Card surface:** background #0284C7, border 0px solid rgb(229, 231, 235), radius 16px, padding 28px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px.

### Iconography
- **Treatment:** Duotone.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 12px rhythm.
- Do reuse the Elevated surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 16px, 24px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 500ms and 300ms. Easing favors ease and 0. Hover behavior focuses on !rotate and z changes.

**Motion Level:** moderate

**Durations:** 500ms, 300ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** !rotate, z, transform, shadow, color
