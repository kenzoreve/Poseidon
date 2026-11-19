---
name: Fluid Treasury Architecture
colors:
  surface: '#f3faff'
  surface-dim: '#c4deec'
  surface-bright: '#f3faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#d9f2ff'
  surface-container-high: '#d2ecfa'
  surface-container-highest: '#cce7f4'
  on-surface: '#031e28'
  on-surface-variant: '#40484b'
  inverse-surface: '#1a343e'
  inverse-on-surface: '#dff4ff'
  outline: '#70787b'
  outline-variant: '#bfc8cb'
  surface-tint: '#2b6673'
  primary: '#003741'
  on-primary: '#ffffff'
  primary-container: '#0b4f5c'
  on-primary-container: '#87bfce'
  inverse-primary: '#97cfdf'
  secondary: '#006b54'
  on-secondary: '#ffffff'
  secondary-container: '#8ff6d3'
  on-secondary-container: '#007259'
  tertiary: '#383121'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f4736'
  on-tertiary-container: '#c1b5a0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b3ecfb'
  primary-fixed-dim: '#97cfdf'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#094e5b'
  secondary-fixed: '#8ff6d3'
  secondary-fixed-dim: '#72d9b8'
  on-secondary-fixed: '#002118'
  on-secondary-fixed-variant: '#00513f'
  tertiary-fixed: '#eee1ca'
  tertiary-fixed-dim: '#d1c5af'
  on-tertiary-fixed: '#211b0d'
  on-tertiary-fixed-variant: '#4e4635'
  background: '#f3faff'
  on-background: '#031e28'
  surface-variant: '#cce7f4'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeral-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  numeral-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 3rem
  margin-sm: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an organic, modern fintech aesthetic that reconciles complex corporate financial engineering with visual tranquility and approachability. The platform transforms the stressful, rigid domain of corporate cash management, idle-yield optimization, and multi-entity liquidity routing into an intuitive, kinetic flow.

The design movement combines **Contemporary Soft Minimalist Fintech** with **Fluid Biophilic Accents**. Visuals depart from typical sterile, cold SaaS dashboards by utilizing warm tactile backgrounds, sweeping wave dividers, and deliberate motion design. Micro-interactions and animated vectors visualize capital as a moving, living current rather than static ledgers. The UI inspires absolute operational certainty, automated precision, and calm clarity for CFOs, treasurers, and startup operators.

## Colors

The palette directly anchors to the natural dynamics of coastal estuaries, utilizing warm organic ground tones balanced against deep maritime structure and luminescent kinetic highlights:

- **Pearl (`#FFFDF8`)**: Canvas baseline. Serves as the primary application background, softening eye strain during long working sessions.
- **Sand (`#F6E9D2`)**: Secondary structural fill. Utilized for alternating full-width layout bands, nested sub-panels, segmented control wells, and elevated metric containers.
- **Deep Teal (`#0B4F5C`)**: Anchor tone. Used for dominant typography, structural framing, high-contrast dark sections (e.g., enterprise feature showcases, analytics command bars), and sharp line iconography.
- **Tide Grey (`#5B7480`)**: Secondary functional tone. Provides low-friction contrast for secondary descriptions, timestamps, table column headers, and structural grid rules.
- **Seafoam (`#6FD6B5`)**: The kinetic catalyst. Reserved for active liquidity paths, real-time cash routing indicators, primary conversion actions, and positive yield vectors.

### Contrast & State Rules
- **Primary CTA Buttons**: Background is Seafoam (`#6FD6B5`) paired with Deep Teal (`#0B4F5C`) typography and icons. Hover states shift background toward a deepened sea-mist (`#5CC4A4`).
- **Dark Mode / Deep Teal Panels**: When surface sections use Deep Teal (`#0B4F5C`), headers use Pearl (`#FFFDF8`), secondary text uses Sand (`#F6E9D2`) at 85% opacity, and outlines utilize Tide Grey (`#5B7480`) at 25% opacity.
- **Borders & Dividers**: Standard surface borders utilize Tide Grey (`#5B7480`) calibrated at 15% opacity (`rgba(91, 116, 128, 0.15)`) against Pearl, and 25% opacity against Sand.

## Typography

The type system is powered by **Plus Jakarta Sans**, offering a balance of geometric precision and rounded letterforms. This humanizes data-dense treasury metrics while maintaining legibility across balance sheets, flow rates, and liquidity schedules.

### Hierarchy & Usage
- **Hero & Display Headlines**: Reserved for landing highlights, top-line cash positions, and primary module headings. Tightly tracked (-0.02em to -0.03em) to keep large text unified and modern.
- **Numeral Tokens**: All financial values, yield percentages, currency tables, and balances apply tabular numerals (`font-feature-settings: "tnum" 1, "cv05" 1`) to preserve column alignment across real-time ledger updates.
- **Labels & Micro-data**: `label-sm` utilizes uppercase transform with +0.05em letter spacing for metric descriptions (e.g., "WEIGHTED APY", "OPERATING BUFFER", "SWEEP FREQUENCY") rendered in Tide Grey (`#5B7480`).

## Layout & Spacing

The layout model utilizes a fluid 12-column structural grid system constrained by a maximum desktop container width of `1280px` for optimal data density and balance. 

### Breakpoints & Reflow
- **Mobile (< 768px)**: 4 columns, `margin-sm` (1.25rem) gutter and outer canvas margins. Sticky navigation collapse into a bottom floating action bar or streamlined header drawer. Multi-stream cash flow diagrams condense into vertical step connectors.
- **Tablet (768px - 1024px)**: 8 columns, `1.5rem` margins and gutters. Multi-tier treasury cards wrap from 3-column rows into 2x2 grids.
- **Desktop (> 1024px)**: 12 columns, `margin` (3rem) outer boundary, `gutter` (1.5rem). Full horizontal telemetry: flow diagram alongside account tiering, real-time balances, and liquidity distribution graphs.

### Spacing Rhythm
Component interiors follow strict modular padding:
- Standard treasury cards utilize `space-xl` (2.5rem) on desktop and `space-lg` (1.5rem) on mobile.
- Section transitions alternate between canvas tones (`#FFFDF8` to `#F6E9D2` or `#0B4F5C`) punctuated by wave SVG masks with matching vertical space buffers (`space-xl` clearance).

## Elevation & Depth

Visual hierarchy is communicated through **tinted ambient shadows**, **tonal surface separation**, and **kinetic z-axis positioning**, eliminating stark black dropshadows in favor of deep-teal-infused atmospheric depth:

### Shadow Tokens
- **Resting Treasury Card**: `0 12px 32px -4px rgba(11, 79, 92, 0.08), 0 4px 12px rgba(11, 79, 92, 0.04)`
- **Hover / Floating Element**: `0 20px 40px -6px rgba(11, 79, 92, 0.12), 0 8px 16px -2px rgba(11, 79, 92, 0.06)`
- **Active / Dragged Node**: `0 24px 48px -8px rgba(11, 79, 92, 0.18), 0 12px 20px -4px rgba(11, 79, 92, 0.08)`
- **Subtle Inset / Well Container**: `inset 0 2px 4px rgba(11, 79, 92, 0.05)`

### Layering Principles
- **Base Canvas**: Pearl (`#FFFDF8`) flat base level (z-index: 0).
- **Section Dividers**: Full-width wave SVG curves seamlessly bridging Pearl, Sand, and Deep Teal zones without sharp edge transitions.
- **Floating Cards**: Cards rest slightly elevated on the canvas. When marked with interactive cash flow nodes, cards subtly float (+4px Y-translation on hover with ambient shadow transition over `240ms cubic-bezier(0.16, 1, 0.3, 1)`).

## Shapes

The design system incorporates organic, soft-cornered geometry. Cards and main structural panels use an intentional `24px` radius (`rounded-3xl` / `1.5rem`) to reinforce visual friendliness and liquidity, contrasting sharply against conventional square enterprise software.

### Curvature Matrix
- **Primary Data & Dashboard Cards**: Strict `24px` (`1.5rem`) border radius on all four vertices.
- **Inner Well Panels & Nested Modules**: Scaled down to `16px` (`1rem`) to ensure balanced nesting within parent cards.
- **Buttons, Badges, Chips & Inputs**: Fully rounded pill shapes (`9999px`) or `12px` roundedness depending on component role. Action pills reinforce flow and rolling currents.
- **Section Dividers**: Organic, smooth wave geometry executed as vector SVG paths. Peak and trough amplitudes range from `32px` to `64px`, introducing natural transitions between alternating Sand and Pearl sections.

## Components

### Buttons
- **Primary CTA**: Background Seafoam (`#6FD6B5`), text Deep Teal (`#0B4F5C`), font weight 600. Fully rounded pill (`9999px`), horizontal padding `1.75rem`, vertical padding `0.875rem`. Features an interactive circular expanding wave ripple on click (`rgba(11, 79, 92, 0.15)` originating from pointer coordinates).
- **Secondary CTA**: Background transparent, 1.5px solid border in Deep Teal (`#0B4F5C`), text Deep Teal. Hover transforms background to Sand (`#F6E9D2`).
- **Subtle / Ghost**: Tide Grey text (`#5B7480`), transparent background, hovering shifts text to Deep Teal (`#0B4F5C`) with a subtle Sand highlight well.

### Cards & Dashboards
- **Treasury Card**: Surface Sand (`#F6E9D2`) or Pearl (`#FFFDF8`), `24px` border radius, bounded by a 1px border in `rgba(91, 116, 128, 0.15)`. Tinted shadow applied: `0 12px 32px -4px rgba(11, 79, 92, 0.08), 0 4px 12px rgba(11, 79, 92, 0.04)`.
- **Floating Status Card**: Floating metric badge with `16px` radius, elevated shadow, and an automated continuous micro-float animation (y-axis translation of 4px over a 4s ease-in-out infinite loop).

### Kinetic Animated Elements
- **Flowing Money Lines**: Branching SVG bezier curves depicting liquidity routing from a main account into automated yield, payroll, and tax buckets. Paths use Seafoam (`#6FD6B5`) strokes (2.5px width) with animated `stroke-dashoffset` running continuously to signal directional transfer velocity.
- **Liquid Percentage Bars**: Horizontal and vertical progress meters. Track background: `rgba(91, 116, 128, 0.12)`. Progress fill: Seafoam (`#6FD6B5`) featuring an animated SVG wave crest at the fill tip simulating liquid volume rising and settling.

### Input Fields & Controls
- **Inputs**: Background Pearl (`#FFFDF8`), border 1.5px `rgba(91, 116, 128, 0.3)`, text Deep Teal (`#0B4F5C`). Rounded-xl (`12px`), padding `0.75rem 1rem`. Focus state: border color Deep Teal (`#0B4F5C`) with an exterior Seafoam glow ring (`box-shadow: 0 0 0 3px rgba(111, 214, 181, 0.35)`).
- **Chips & Filters**: Pill-shaped (`9999px`), Sand background, Tide Grey text. Active state adopts Deep Teal background with Pearl text.
- **Checkboxes & Radios**: Custom circular or soft-rounded indicators. Checked state fills with Seafoam (`#6FD6B5`) and Deep Teal iconography.

### Section Dividers
- **Wave Dividers**: Responsive SVG dividers placed at section boundaries between Pearl and Sand, or Sand and Deep Teal. Top and bottom edges transition cleanly without hard vertical lines.