---
name: Aura Atmosphere
colors:
  surface: '#f6faff'
  surface-dim: '#d5dbe0'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4fa'
  surface-container: '#e9eef4'
  surface-container-high: '#e4e9ef'
  surface-container-highest: '#dee3e9'
  on-surface: '#171c21'
  on-surface-variant: '#424653'
  inverse-surface: '#2b3136'
  inverse-on-surface: '#ecf1f7'
  outline: '#737785'
  outline-variant: '#c3c6d6'
  surface-tint: '#1358c8'
  primary: '#0c55c5'
  on-primary: '#ffffff'
  primary-container: '#376fdf'
  on-primary-container: '#fefcff'
  inverse-primary: '#b1c5ff'
  secondary: '#8b5000'
  on-secondary: '#ffffff'
  secondary-container: '#ffa84b'
  on-secondary-container: '#703f00'
  tertiary: '#006a44'
  on-tertiary: '#ffffff'
  tertiary-container: '#008558'
  on-tertiary-container: '#f6fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419d'
  secondary-fixed: '#ffdcbe'
  secondary-fixed-dim: '#ffb871'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6a3c00'
  tertiary-fixed: '#54feb3'
  tertiary-fixed-dim: '#27e199'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#005234'
  background: '#f6faff'
  on-background: '#171c21'
  surface-variant: '#dee3e9'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an airy, tactile, and sensory meteorological experience. It departs from sterile, diagnostic forecasting tools to provide a calming, luminous environmental canvas that feels like gazing through an open skylight on a crisp morning. 

Targeting weather enthusiasts, smart home dwellers, and daily planners, the interface balances precision instruments with soft, tactile warmth. The aesthetic fuses **Neomorphism-lite** with **Modern Soft Tactile** styling: ultra-smooth pill containers, pure white elevated floating tiles, subtle ambient sky shadows, and expressive atmospheric gradients (solar amber, mint ozone, sunset coral, and crisp troposphere blue). The interface evokes clarity, serenity, and effortless awareness.

## Colors

The color architecture is built around dynamic sky states and environmental clarity:
- **Canvas & Neutral Base (`#EDF2F8`)**: A pale, misted sky-blue slate that provides contrast for bright pure-white cards without harsh gray tones.
- **Primary Sky (`#4D82F3`)**: The core active tint for current day selections, primary buttons, high-priority icons, and fluid bar metrics.
- **Secondary Solar Amber (`#FFA84A`)**: Radiating warmth, utilized for solar telemetry, golden-hour alerts, UV index markers, and secondary mini-dashboards.
- **Tertiary Mint Ozone (`#00D68F`)**: Dedicated to pristine Air Quality Index (AQI) values, eco-readings, and positive environmental indicators.
- **Semantic Sunset Coral (`#FF6584`)**: Reserved for severe storm flags, high temperatures, humidity warnings, and active satellite alerts.
- **Text & Contrast Structure**: Titles and critical numerals use deep twilight slate (`#1E293B`), secondary telemetry labels utilize atmospheric slate (`#64748B`), and passive borders employ ultra-low-opacity sky glazes (`rgba(77, 130, 243, 0.08)`).

## Typography

The typography uses Plus Jakarta Sans throughout for clean geometric balance and organic, friendly letterforms.

- **Numerals**: Metrics like temperature, wind speed, and precipitation levels use heavy tabular weights (`700` and `800`) with tight letter-spacing to form recognizable focal figures.
- **Micro-labels**: Sensor names (`PM2.5`, `SO2`, `UV`, `Hum`) employ bold uppercase micro-tokens (`label-sm` or `label-md`) to ensure legibility within dense indicator grids.
- **Editorial Hierarchy**: Salutations and geographic locations use `headline-lg` and `headline-xl` with softened weights to maintain an approachable tone.

## Layout & Spacing

The layout is arranged around a master canvas anchored by a vertical utility dock, a central multi-widget telemetry grid, and a right-hand flagship hero card:

- **Grid Strategy**: Desktop layouts use an asymmetrical 12-column grid. The utility dock occupies 1 column (or a fixed 72px pill strip), the primary operational dashboard spans 7 columns, and the immersive weather overview claims the remaining 4 columns.
- **Responsive Adaptations**:
  - **Desktop (1280px+)**: Multi-pane layout with persistent sidebar dock and fixed right-hand panoramic card.
  - **Tablet (768px - 1279px)**: Reflows into a 2-column layout; the right hero transforms into a sticky top banner or carousel.
  - **Mobile (< 768px)**: Single-column linear layout. The forecast strips switch to horizontal momentum scrolling, while floating metrics stack into paired 2-column modules.
- **Rhythm**: Component interiors maintain an open padding cadence (`space-lg` for primary panels, `space-md` for sub-cards).

## Elevation & Depth

Visual depth is achieved through ambient, diffuse light rather than heavy structural borders:

1. **Ambient Shadow Architecture**: Surfaces sit above the sky background using a multi-stop, blue-tinted drop shadow:
   `box-shadow: 0 10px 30px -5px rgba(77, 130, 243, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03);`
2. **Elevated Active State**: Selected elements (such as the active Wednesday forecast card) lift further, intensifying the shadow and shifting their background to an atmospheric blue gradient (`#568BF5` to `#3B74EE`) with a soft glow:
   `box-shadow: 0 14px 28px -4px rgba(77, 130, 243, 0.35);`
3. **Inner Pill Well Depth**: Input surfaces, search pills, and secondary telemetry badges sit slightly sunken via an ultra-subtle 1px border (`rgba(255, 255, 255, 0.8)`) and soft inner light.
4. **Vibrant Gradients**: Accent cards (Sunset, Coral, and Golden Sun) use smooth multi-stop linear gradients to establish clear focal points without visually cluttering the interface.

## Shapes

The design system relies on smooth, expansive curvatures that echo rounded cumulus clouds and ergonomic handheld instruments:
- **Base Cards & Modules**: Built with extra-large radii (`1.25rem` to `1.5rem` / `20px-24px`), avoiding harsh rectangular corners.
- **Navigation Dock & Floating Rails**: Distinctive pill shapes (`9999px`) on floating toolbars and docked segmented controls.
- **Metric Micro-Chips**: Pill-styled rounded tags (`rounded-lg` / `1rem`) for pollutant levels and wind gauges.
- **Icon Enclosures**: Soft circular badges (`border-radius: 50%`) with translucent backdrops for sun and rain pictograms.

## Components

### Cards & Telemetry Containers
- **Standard Card**: Pure white background (`#FFFFFF`), `22px` border radius, subtle blue-tinted ambient shadow. Internal padding scales with content (`space-md` to `space-lg`).
- **Accent Hero Card**: Full-bleed sky-blue or sunset gradient, white typography, rounded `24px` radius, accompanied by 3D-styled meteorological illustrations.
- **Micro Metric Tile**: Soft pastel background (e.g., `#EBFBEE` for good AQI, `#FEF4E8` for solar info), holding a bold value, an uppercase label, and an optional status glyph.

### Buttons & Interactive Controls
- **Primary Pill Button**: Saturated sky blue (`#4D82F3`), white semi-bold text, fully rounded pill boundaries (`9999px`), with light hover lift.
- **Secondary / Ghost Button**: Translucent sky fill (`rgba(77, 130, 243, 0.08)`), primary blue text, zero border.
- **Toggle Switches**: Soft pill-shaped tracks with white floating thumb nodes carrying contextual icons (e.g., sun and moon glyphs).

### Input Fields & Search
- **Pill Search Bar**: Elevated white or sky-frosted background, fully rounded pill radius (`9999px`), faint inner shadow or soft edge highlight, paired with a leading muted search icon and trailing location badge.

### Charts & Weather Visualizations
- **Dual-State Bar Graphs**: Vertical pill bars featuring split metrics (such as rainfall blue atop solar amber), using rounded ends on both top and bottom segments.
- **AQI Metric Row**: Equal-width vertical pill containers displaying numeric values above sub-labels (e.g., `PM2.5`, `CO`, `NO2`), color-keyed to environmental quality scales.

### Weather Forecast Strip
- **Forecast Capsule**: Vertical pill containers displaying the day label, 3D weather glyph, and temperature. Inactive days remain clean white; the active day transitions to a primary blue fill with white text and an ambient cast shadow.