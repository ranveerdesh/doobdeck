---
name: Cinematic Archival
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dbc2b0'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a38c7c'
  outline-variant: '#554336'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#d97707'
  on-primary-container: '#432100'
  inverse-primary: '#904d00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c8c6c5'
  on-tertiary: '#303030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: monospace
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 32px
  container-max: 1440px
  grid-columns: '12'
---

## Brand & Style

This design system is built for a curatorial and immersive experience, prioritizing the visual weight of high-fidelity imagery. The personality is authoritative, precise, and sophisticated—reminiscent of a digital film archive or a high-end fashion editorial. It targets professionals in the creative and film industries who require a tool that feels like a workspace but looks like a gallery.

The aesthetic leans heavily into **Minimalism** with a **Cinematic Editorial** twist. It avoids unnecessary decoration, using structural lines and negative space to frame content. The interface should feel like it belongs in a darkened theater, where the UI recedes to let the "shot" take center stage. Every interaction should feel intentional and weighted, evoking a sense of premium craftsmanship.

## Colors

The color strategy is "Ink & Amber." The foundation is a deep, near-black charcoal (#0F0F0F) which provides a neutral, low-strain canvas for image viewing. For even deeper structural separation, an "Obsidian" black is used for background layers.

The accent color is a sophisticated Amber/Gold. This is used sparingly for high-value interactions, active states, and focus indicators to provide a warm, premium contrast against the cold neutrals. Secondary neutrals are muted grays used for borders and metadata to maintain a clear information hierarchy without distracting from the visual assets.

## Typography

This design system utilizes a dual-font approach to balance editorial elegance with technical precision. **Inter** serves as the primary typeface, chosen for its exceptional legibility and neutral, systematic character. It handles all primary navigation, headlines, and body copy.

To ground the system in its cinematic/technical roots, a **monospace** font is used for metadata, labels, and technical specifications (such as aspect ratios, focal lengths, or timecodes). This creates a "spec-sheet" aesthetic that contrasts beautifully with the clean sans-serif headlines. Heavy weights are reserved for large headers, while metadata relies on medium weights and slightly increased letter spacing for clarity at small sizes.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model within a maximum container width of 1440px, ensuring that editorial compositions remain balanced on wide displays. A 12-column system provides the flexibility needed for complex image grids and dense information sidebars.

Information density is high but remains clear through the disciplined use of an 8px spacing rhythm. Image-forward layouts should utilize "tight" gutters (16px) to maximize visual real estate, while page margins remain generous (32px or more) to provide the necessary breathing room that defines a "high-end" feel. Content should be grouped logically in panels, with clear vertical lines of alignment.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. This maintains a flat, modern, editorial profile. 

1.  **Level 0 (Base):** The obsidian background (#050505).
2.  **Level 1 (Surface):** The charcoal canvas (#0F0F0F) used for main content areas.
3.  **Level 2 (Panels):** Elevated components like cards or sidebars use a slightly lighter neutral (#1A1A1A) with a subtle, 1px semi-transparent border (white at 10% opacity).

Shadows, if used, must be extremely diffused and faint, acting more as a soft glow to separate floating elements like modals from the darkened background.

## Shapes

The shape language is strictly **Soft (0.25rem)**. This slight rounding takes the edge off the "brutal" charcoal palette while maintaining a professional, structured appearance. It avoids the playfulness of larger radii, keeping the focus on the rectangular nature of film frames.

Interactive elements like buttons and input fields follow this 4px standard. For large-scale imagery or primary containers, the radius may be increased slightly (8px) to soften the overall grid, but should never approach "pill-shaped" or highly rounded territory.

## Components

### Buttons
Buttons are high-contrast and minimalist. Primary buttons utilize a solid Amber/Gold fill with black text. Secondary buttons are outlined with a 1px border and use ghost styling. Interaction states (hover) should involve a subtle brightness shift rather than a color change.

### High-Fidelity Image Grids
The core component of the system. Images should be displayed in a clean grid with a 1px "inner-stroke" border to define the frame. Hover states on images should reveal technical metadata in the monospace font, overlaid with a subtle dark gradient for legibility.

### Chips & Tags
Used for film categories or keywords. These are small, rectangular (4px radius), using a dark gray background and subtle white text. They should feel like "labels" on a file folder.

### Input Fields & Search
Input fields are "ghost" style—transparent backgrounds with a 1px bottom border or subtle full border. The search bar is a prominent, high-density component, often stretching the full width of its container or sidebar, utilizing the monospace font for query text to emphasize the "database" nature of the product.

### Sidebar Navigation
Sidebars are dense, using a vertical list format. Icons are stroke-based and minimal. Active states are indicated by a vertical Amber bar on the leading edge of the list item, rather than a full background fill.