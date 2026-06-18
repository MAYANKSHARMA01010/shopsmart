# ShopSmart — Design System
## Chronicle Revised · Version 3.0

---

# SECTION 1: DESIGN PHILOSOPHY

## Product Identity

ShopSmart is a professional product management tool. The people using it are operators, buyers, and merchandisers — not casual consumers. They are in the product for hours at a stretch. They need to scan quickly, act confidently, and trust what they see.

**The interface must feel:**
- Warm but precise
- Calm but alive
- Legible at a glance
- Premium without being decorative

**What this is not:**
- A fintech dashboard (avoid cold blues and clinical neutrals)
- A consumer app (avoid playful rounded corners and pastel fills)
- An internal admin tool (avoid density-first, joyless grids)
- A generic SaaS template (avoid the Inter + purple + white formula)

## Design Influences

- **Mercury Bank** — warmth in a financial product, considered whitespace
- **Stripe Dashboard** — unbeatable typographic hierarchy, calm color system
- **Linear** — motion that confirms rather than entertains
- **Framer** — editorial confidence, strong display type
- **Linen-era editorial design** — tactile warmth, structured but breathable

## Core Principles

1. **Warmth before neutrality.** Every surface, every shadow, every border should carry warmth. No cool-gray neutrals.
2. **Hierarchy before decoration.** Type and spacing do the heavy lifting. Color is used structurally, not aesthetically.
3. **Motion confirms, it does not perform.** Every animation has a function. Nothing moves for its own sake.
4. **Both themes have identity.** Light mode is paper and daylight. Dark mode is walnut and lamplight. Neither is an inversion of the other.
5. **Accessibility is not a constraint, it is a craft decision.** WCAG AA is the floor, not the ceiling.

---

# SECTION 2: COLOR SYSTEM

## 2.1 Philosophy

The palette is rooted in organic, earth-derived tones rather than synthetic digital primaries. The primary brand color family sits in the **deep forest ink** spectrum — teal leaning toward hunter green, desaturated enough to feel grown-up, saturated enough to have character.

The warm secondary accent (used sparingly) sits in the **amber-sienna** family — not orange, not gold, just warm enough to catch the eye when it matters.

Both themes are built on **warm neutral foundations** — not black, not pure white, not cool gray.

---

## 2.2 Light Theme

**Foundation philosophy:** Paper, parchment, and warm sand. Natural light on a good writing desk. Nothing sterile.

### Backgrounds & Surfaces

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-bg` | Warm Parchment | `#F4F1EC` | Page background |
| `--color-surface` | Warm White | `#FDFCFA` | Cards, panels |
| `--color-surface-elevated` | Pure White | `#FFFFFF` | Modals, dropdowns, floating elements |
| `--color-surface-sunken` | Warm Sand | `#EDE9E2` | Inset wells, code blocks, table headers |

**Rationale:** Pure white is never used as a page background — it creates unnecessary glare and reads sterile. `#F4F1EC` is warm enough to feel like premium paper but neutral enough not to read as yellow. Cards at `#FDFCFA` pop cleanly against it.

### Borders

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-border` | Warm Linen | `#DDD9D2` | Default card borders, dividers |
| `--color-border-strong` | Warm Tan | `#B8B2A9` | Focus rings, active element outlines |
| `--color-border-subtle` | `rgba(0,0,0,0.05)` | Ghost borders for layered surfaces |

**Rule:** Borders are used structurally, not decoratively. When tonal contrast already separates two surfaces, no border is needed.

### Brand Colors — Primary

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-primary` | Deep Forest | `#1A5C52` | Primary buttons, active nav, key CTAs |
| `--color-primary-hover` | Darker Forest | `#154940` | Hover state |
| `--color-primary-active` | `#103B34` | Press/active state |
| `--color-primary-surface` | Forest Mist | `#EBF5F3` | Selected row tints, active pill bg |
| `--color-primary-border` | Forest Haze | `#AECDC9` | Border on primary-tinted containers |

**Rationale:** This is not teal. It is not the "startup green." It sits between hunter green and deep forest ink — desaturated enough to read as intentional and sophisticated, saturated enough to carry authority. It earns its position as a brand color rather than borrowing from a template.

### Brand Colors — Warm Accent (Use sparingly)

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-accent` | Sienna Amber | `#A6521A` | Highlight moments only: new badge, onboarding CTA, empty state illustration tint |
| `--color-accent-surface` | Amber Dust | `#FBF0E8` | Background tint for accent-tagged elements |
| `--color-accent-border` | `#D4956A` | Border for accent-tinted containers |

**Rule:** The accent color appears on at most 1–2 elements per screen. If it appears more frequently, it loses meaning. It is a signal, not a fill.

### Semantic Colors

| Token | Light Value | Name |
|---|---|---|
| `--color-success` | `#156A42` | Deep Clover |
| `--color-success-surface` | `#EDF7F2` | |
| `--color-success-border` | `#A3D5BE` | |
| `--color-warning` | `#7C4A0F` | Bark Amber |
| `--color-warning-surface` | `#FEF6EC` | |
| `--color-warning-border` | `#D4A46A` | |
| `--color-error` | `#9B2A2A` | Garnet |
| `--color-error-surface` | `#FDF2F2` | |
| `--color-error-border` | `#D49A9A` | |
| `--color-info` | `#1A4E8C` | Deep Cobalt |
| `--color-info-surface` | `#EDF3FB` | |
| `--color-info-border` | `#A3BCE0` | |

**Rationale:** Every semantic color in light mode is desaturated and deep — they communicate meaning without shouting. A success state does not need to be neon green. A warning does not need to look alarming. Garnet for error instead of bright red is a deliberate choice: it reads as serious, not panicked.

### Text

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-text-primary` | Espresso | `#1C1916` | Headings, primary body, important labels |
| `--color-text-secondary` | Mocha | `#5C5248` | Supporting copy, metadata, captions |
| `--color-text-muted` | Warm Dust | `#9B918A` | Placeholder text, disabled labels |
| `--color-text-on-primary` | `#FFFFFF` | Text on primary-colored backgrounds |
| `--color-text-on-accent` | `#FFFFFF` | Text on accent-colored backgrounds |

---

## 2.3 Dark Theme

**Foundation philosophy:** A study in espresso, walnut, and aged paper under lamplight. Not a void. Not a hacker terminal. The dark theme is warm and intimate, not cold and technical.

**Core rule:** Dark mode surfaces never go below `#111009`. Blacks are never pure. Every surface carries warmth.

### Backgrounds & Surfaces

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-bg` | Espresso | `#141210` | Page background |
| `--color-surface` | Walnut | `#1D1B18` | Cards, panels |
| `--color-surface-elevated` | Warm Charcoal | `#262320` | Dropdowns, modals, popovers |
| `--color-surface-sunken` | Deep Roast | `#0F0E0C` | Inset wells, sunken containers |

**Rationale:** `#141210` is a warm near-black — it reads as deep and intentional, not void-black. Cards at `#1D1B18` are visibly above the background without needing a border. Modals at `#262320` are visibly above cards. Each layer has identity.

### Borders

| Token | Name | Value | Usage |
|---|---|---|---|
| `--color-border` | Ember Smoke | `rgba(255,248,240,0.08)` | Default borders |
| `--color-border-strong` | Warm Ash | `rgba(255,248,240,0.16)` | Focus rings, interactive outlines |
| `--color-border-subtle` | `rgba(255,248,240,0.04)` | Ghost separation |

**Rationale:** Borders in dark mode use warm-tinted whites (`#FFF8F0` base) rather than pure white. This maintains the warmth of the surface palette.

### Brand Colors — Primary

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-primary` | Sage Mist | `#4DB8A8` | Primary CTAs, active elements |
| `--color-primary-hover` | `#62C8B9` | Lighter on hover (reversed from light mode) |
| `--color-primary-active` | `#39A898` | |
| `--color-primary-surface` | `rgba(77,184,168,0.12)` | Selected rows, active states |
| `--color-primary-border` | `rgba(77,184,168,0.25)` | |

**Rationale:** The light mode primary (`#1A5C52`) is too dark for dark backgrounds. On dark mode we shift to a lighter teal — same hue family, different luminosity. `#4DB8A8` has warmth and enough saturation to read clearly without appearing neon.

### Brand Colors — Warm Accent

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-accent` | Ember Gold | `#D4884A` | Same sparingly-rule as light mode |
| `--color-accent-surface` | `rgba(212,136,74,0.12)` | |
| `--color-accent-border` | `rgba(212,136,74,0.25)` | |

### Semantic Colors

| Token | Dark Value | Name |
|---|---|---|
| `--color-success` | `#4CC48A` | Warm Mint |
| `--color-success-surface` | `rgba(76,196,138,0.1)` | |
| `--color-warning` | `#D4944A` | Warm Honey |
| `--color-warning-surface` | `rgba(212,148,74,0.1)` | |
| `--color-error` | `#D46B6B` | Muted Coral |
| `--color-error-surface` | `rgba(212,107,107,0.1)` | |
| `--color-info` | `#6A9ECC` | Steel Blue |
| `--color-info-surface` | `rgba(106,158,204,0.1)` | |

### Text

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-text-primary` | Warm Cream | `#F2EDE6` | Headings, primary body |
| `--color-text-secondary` | Warm Latte | `#A8A09A` | Supporting copy, metadata |
| `--color-text-muted` | Warm Shadow | `#6A6259` | Placeholder, disabled |

---

# SECTION 3: TYPOGRAPHY SYSTEM

## 3.1 Font Pairing

**Display:** `Fraunces` — Variable optical-size serif (Google Fonts, free).
**Body & UI:** `DM Sans` — Geometric grotesque (Google Fonts, free).
**Mono:** `JetBrains Mono` — For prices, IDs, stock counts, any tabular data (Google Fonts, free).

**Why this pairing works for Chronicle Revised:**

Fraunces is confident and editorial at large sizes, but it knows when to step back — it is only used for display headings (page titles, hero text, empty state headers). It creates a sense that the product was designed, not generated.

DM Sans handles every UI element: labels, body copy, buttons, navigation, form text. It is geometric enough to feel modern, friendly enough not to feel cold. Its letterforms at 13–14px are excellent.

The contrast between a warm humanist serif (display) and a precise geometric grotesque (body) is the visual signature of the Chronicle direction. It is what separates it from the "Inter everywhere" template look.

## 3.2 Type Scale

**Scale philosophy:** Borrowed from A's structural rigor — strong contrast between heading levels, never two adjacent sizes that feel similar.

### Desktop Scale

| Token | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `--text-display-xl` | Fraunces | 48px | 600 | 1.1 | -0.025em | Hero headline only |
| `--text-display-lg` | Fraunces | 36px | 600 | 1.15 | -0.02em | Page-level empty states |
| `--text-heading-xl` | Fraunces | 28px | 600 | 1.2 | -0.015em | Page titles (H1) |
| `--text-heading-lg` | DM Sans | 20px | 700 | 1.3 | -0.01em | Section headers (H2) |
| `--text-heading-md` | DM Sans | 17px | 600 | 1.35 | 0 | Card titles, modal headers (H3) |
| `--text-heading-sm` | DM Sans | 14px | 600 | 1.4 | 0 | Sub-section titles (H4) |
| `--text-body-lg` | DM Sans | 16px | 400 | 1.65 | 0 | Primary editorial body copy |
| `--text-body-md` | DM Sans | 14px | 400 | 1.6 | 0 | Default UI text, descriptions |
| `--text-body-sm` | DM Sans | 13px | 400 | 1.5 | 0 | Supporting copy, captions |
| `--text-label-md` | DM Sans | 12px | 600 | 1.4 | 0.04em | Uppercase labels, category pills |
| `--text-label-sm` | DM Sans | 11px | 600 | 1.3 | 0.06em | Micro labels, status badges |
| `--text-mono-md` | JetBrains Mono | 13px | 400 | 1.5 | 0 | Prices, stock counts, IDs |
| `--text-mono-sm` | JetBrains Mono | 12px | 400 | 1.4 | 0 | Compact tabular values |

### Mobile Scale (below 768px)

| Token | Size | Notes |
|---|---|---|
| `--text-display-xl` | 36px | Scales down significantly |
| `--text-display-lg` | 28px | |
| `--text-heading-xl` | 24px | |
| `--text-heading-lg` | 18px | |
| `--text-heading-md` | 16px | |
| All body tokens | Same as desktop | Body text never shrinks below 13px |

## 3.3 Hierarchy Rules

1. Only one `display` token per screen — it is a signature, not a style.
2. Never use two adjacent text sizes that differ by less than 2px within the same visual section.
3. `text-label-md` is always uppercase with `0.04em` tracking. Never use uppercase on body copy.
4. Price values always use `--text-mono-md` — they are data, not prose.
5. DM Sans at 500 weight is not in the scale — use 400 (body) or 600 (heading). Never 500. Avoid the middle weight.

---

# SECTION 4: MOTION SYSTEM

## 4.1 Philosophy — "Lamplight"

Motion in Chronicle Revised should feel like the product is breathing, not performing. It responds to the user, it does not anticipate them. The pacing is slightly warmer and more deliberate than a fintech tool — but not slow or theatrical.

**The test for every animation:** Would removing this animation cause confusion about what just happened? If no, remove it.

## 4.2 Duration Scale

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | 80ms | Checkbox tick, radio select, toggle flip |
| `--duration-fast` | 150ms | Hover color/border transitions |
| `--duration-base` | 220ms | Dropdown open, tooltip appear, badge mount |
| `--duration-medium` | 300ms | Modal open, drawer enter, page section reveal |
| `--duration-slow` | 420ms | Theme switch cross-fade |
| `--duration-skeleton` | 1600ms | Skeleton shimmer cycle |

## 4.3 Easing Curves

| Token | Value | Usage |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions. Fast start, gradual settle. |
| `--ease-enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Elements entering the screen (decelerate in) |
| `--ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | Elements leaving the screen (accelerate out) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Confirmation moments only: checkmark appear, success toast |

## 4.4 Interaction States

### Hover
- Background: `transition: background-color var(--duration-fast) var(--ease-standard)`
- Border: `transition: border-color var(--duration-fast) var(--ease-standard)`
- Text color: same
- **No transform on hover.** Scale is reserved for press states only.

### Press / Active
- Scale: `transform: scale(0.98)` — duration `var(--duration-instant)`, easing standard
- Applied to: buttons, clickable cards
- **Not applied to:** nav links, table rows, text links

### Focus
- Ring: `box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-primary)`
- Duration: `var(--duration-fast)`
- Always visible on keyboard navigation (`:focus-visible` only, not `:focus`)

## 4.5 Component Animations

### Dropdown / Select Menu
- Enter: `opacity: 0→1` + `transform: translateY(-6px)→translateY(0)` 
- Duration: `var(--duration-base)`
- Easing: `var(--ease-enter)`
- Exit: `opacity: 1→0` + `transform: translateY(0)→translateY(-4px)`
- Duration: `var(--duration-fast)` (exit is faster than enter)
- Easing: `var(--ease-exit)`

### Modal
- Backdrop: `opacity: 0→1`, duration `var(--duration-base)`, easing standard
- Panel: `opacity: 0→1` + `transform: scale(0.96)→scale(1)` + `translateY(8px)→translateY(0)`
- Duration: `var(--duration-medium)`
- Easing: `var(--ease-enter)`
- Exit: reverse, duration `var(--duration-base)`

### Drawer (right-side)
- Enter: `transform: translateX(100%)→translateX(0)`
- Duration: `var(--duration-medium)`
- Easing: `var(--ease-enter)`
- Exit: `transform: translateX(0)→translateX(100%)`
- Duration: `var(--duration-base)`
- Easing: `var(--ease-exit)`

### Toast Notification
- Enter: `opacity: 0→1` + `transform: translateY(12px)→translateY(0)`
- Duration: `var(--duration-base)`
- Easing: `var(--ease-spring)` — the only place spring easing is used for toast
- Auto-dismiss fade: `opacity: 1→0`, duration `var(--duration-fast)`

### Tooltip
- Enter: `opacity: 0→1` + `transform: translateY(4px)→translateY(0)`
- Duration: `var(--duration-fast)`
- Easing: `var(--ease-enter)`
- Delay before appearing: 400ms (prevents flicker on fast mouse passes)

### Theme Switch
- All surfaces, borders, and text: `transition: background-color, border-color, color`
- Duration: `var(--duration-slow)` (420ms)
- Easing: `var(--ease-standard)`
- Shadows and box-shadows: also transition, same duration
- The theme toggle icon rotates 180°: `transform: rotate(0)→rotate(180deg)`, `var(--duration-slow)`

### Skeleton Screen
- Animation: horizontal shimmer sweep using `background: linear-gradient(90deg, surface, surface-elevated, surface)`
- `background-size: 200% 100%`
- `animation: shimmer var(--duration-skeleton) ease-in-out infinite`
- Keyframes: `from { background-position: 200% 0 } to { background-position: -200% 0 }`
- Light mode: shimmer from `#EDE9E2` → `#FDFCFA` → `#EDE9E2`
- Dark mode: shimmer from `#1D1B18` → `#262320` → `#1D1B18`

### Page Transition (Next.js)
- Content area: `opacity: 0→1`, duration `var(--duration-base)`, easing `var(--ease-enter)`
- Applied via layout-level CSS animation class

## 4.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

All transforms collapse to instant. All opacity transitions collapse to instant. Skeleton becomes a static placeholder. Theme switch is instantaneous.

---

# SECTION 5: SPACING & LAYOUT SYSTEM

## 5.1 Base Scale

Base unit: **4px**

| Token | Value | Usage |
|---|---|---|
| `--space-0.5` | 2px | Micro adjustments, icon nudges |
| `--space-1` | 4px | Icon-to-label gap, tight row gap |
| `--space-2` | 8px | Inner padding for compact elements (badges, pills) |
| `--space-3` | 12px | Compact card internal gap, button vertical padding |
| `--space-4` | 16px | Standard inner padding, form row gap |
| `--space-5` | 20px | Form field gap |
| `--space-6` | 24px | Card padding (default) |
| `--space-8` | 32px | Card padding (comfortable) |
| `--space-10` | 40px | Section sub-header margin |
| `--space-12` | 48px | Intra-section spacing |
| `--space-16` | 64px | Section-to-section spacing |
| `--space-20` | 80px | Page-level section breathing |
| `--space-24` | 96px | Hero padding |

## 5.2 Layout Grid

| Breakpoint | Label | Min Width | Container | Columns | Gutter |
|---|---|---|---|---|---|
| `xs` | Mobile S | 0px | 100% | 4 | 16px |
| `sm` | Mobile L | 480px | 100% | 8 | 20px |
| `md` | Tablet | 768px | 720px | 12 | 24px |
| `lg` | Desktop | 1024px | 960px | 12 | 24px |
| `xl` | Wide | 1280px | 1140px | 12 | 32px |
| `2xl` | Ultra | 1536px | 1280px | 12 | 32px |

Container: `max-width: 1140px`, `margin-inline: auto`, `padding-inline: clamp(1rem, 5vw, 2rem)`

## 5.3 Component Spacing Rules

**Cards:**
- Standard padding: `--space-6` (24px)
- Comfortable padding (hero cards, feature cards): `--space-8` (32px)
- Compact padding (table rows, list items): `--space-4` (16px) vertical, `--space-6` horizontal

**Forms:**
- Label-to-input gap: `--space-2` (8px)
- Field-to-field gap (vertical): `--space-5` (20px)
- Section-to-section gap: `--space-10` (40px)
- Button top margin from last field: `--space-6` (24px)

**Navigation:**
- Navbar height: 64px
- Nav item horizontal padding: `--space-4` (16px)
- Nav item vertical padding: `--space-2` (8px)

**Vertical Rhythm:**
- H1 margin-bottom: `--space-3` (12px)
- H2 margin-top: `--space-12` (48px), margin-bottom: `--space-4` (16px)
- H3 margin-top: `--space-8` (32px), margin-bottom: `--space-3` (12px)
- Paragraph margin-bottom: `--space-4` (16px)

---

# SECTION 6: COMPONENT SPECIFICATIONS

## 6.1 Buttons

**Three variants, three sizes, five states.**

### Variants
- **Primary:** `background: --color-primary`, `color: --color-text-on-primary`
- **Secondary:** `background: transparent`, `border: 1px solid --color-border-strong`, `color: --color-text-primary`
- **Ghost:** `background: transparent`, no border, `color: --color-primary`
- **Destructive:** `background: --color-error-surface`, `border: 1px solid --color-error-border`, `color: --color-error`

### Sizes
- `sm`: height 32px, padding `8px 14px`, font `--text-body-sm` 600 weight
- `md` (default): height 40px, padding `10px 18px`, font `--text-body-md` 600 weight
- `lg`: height 48px, padding `12px 24px`, font `--text-body-md` 600 weight

### Radius
- Default: `8px` (not pill, not sharp — considered)

### States
- Default: defined above
- Hover: primary darkens (`--color-primary-hover`), secondary border strengthens, transition `var(--duration-fast)`
- Active/Press: `transform: scale(0.98)`, transition `var(--duration-instant)`
- Focus: `box-shadow: 0 0 0 2px --color-bg, 0 0 0 4px --color-primary`
- Disabled: `opacity: 0.45`, `cursor: not-allowed`, no hover/press effects
- Loading: left icon replaced with spinner (16px), button text unchanged, disabled state

### Rules
- No gradient backgrounds on buttons
- No box-shadow glow on primary buttons
- Icon-only buttons must have `aria-label`
- Loading state must prevent double-submit (pointer-events: none)

## 6.2 Form Inputs

**Three variants: text input, textarea, select.**

### Base Style
- Background: `--color-surface-sunken` (light) / `--color-surface-sunken` (dark)
- Border: `1px solid --color-border`
- Border-radius: `8px`
- Height: 40px (input, select), auto (textarea, min 96px)
- Padding: `10px 14px`
- Font: `--text-body-md`

### Label Style
- Position: always above the input
- Font: `--text-label-md` (12px, 600 weight, uppercase, 0.04em tracking)
- Color: `--color-text-secondary`
- Margin-bottom: `--space-2` (8px)

### States
- Hover: `border-color: --color-border-strong`, transition `var(--duration-fast)`
- Focus: `border-color: --color-primary`, `box-shadow: 0 0 0 3px rgba(primary, 0.15)`, transition `var(--duration-fast)`
- Error: `border-color: --color-error`, `box-shadow: 0 0 0 3px rgba(error, 0.12)`
- Disabled: `opacity: 0.5`, `background: --color-surface-sunken`, `cursor: not-allowed`
- Read-only: `background: transparent`, no border change on focus

### Error Message
- Font: `--text-body-sm`, `color: --color-error`
- Margin-top: `--space-1` (4px)
- Prefix with error icon (16px)

### Select
- Custom chevron icon (not browser default)
- Same size/padding as text input
- Dropdown menu uses Card elevation style

## 6.3 Cards

**Two variants: static, interactive.**

### Static Card
- Background: `--color-surface`
- Border: `1px solid --color-border`
- Border-radius: `12px`
- Padding: `--space-6` (24px)
- No hover state
- Shadow: none in light mode, none in dark mode (tonal elevation only)

### Interactive Card (clickable)
- Same base as static
- Hover: `border-color: --color-border-strong`, `background: --color-surface-elevated`, transition `var(--duration-fast)`
- Active: `transform: scale(0.995)`, transition `var(--duration-instant)`
- Cursor: `pointer`

### Product Card (specific)
- Border-radius: `12px`
- Image area: `160px` height, `border-radius: 12px 12px 0 0`, `background: --color-surface-sunken`
- Body padding: `--space-5` (20px)
- Footer: `padding-top: --space-4`, `border-top: 1px solid --color-border`
- Category pill: `--text-label-sm`, `background: --color-primary-surface`, `color: --color-primary`, `padding: 3px 8px`, `border-radius: 6px`
- Price: `--text-mono-md`, 600 weight, `color: --color-text-primary`

## 6.4 Navigation

### Navbar
- Height: 64px
- Background: `--color-surface / 0.8` with `backdrop-filter: blur(12px)` + `saturate(180%)`
- Border-bottom: `1px solid --color-border`
- Position: sticky, top 0, z-index 100

### Nav Links
- Default: `color: --color-text-secondary`, no background
- Hover: `color: --color-text-primary`, `background: --color-surface-sunken`, transition `var(--duration-fast)`
- Active: `color: --color-primary`, `background: --color-primary-surface`, `border-bottom: 2px solid --color-primary`
- Font: `--text-body-md`, weight 500

## 6.5 Toasts

- Position: bottom-right, `16px` from edges
- Width: `340px`
- Max stack: 3 (oldest auto-dismissed when 4th appears)
- Border-radius: `10px`
- Padding: `--space-4` `--space-5` (16px 20px)
- Variants: success (forest/mint border-left), warning, error, info
- Border-left: `3px solid --color-{variant}` — the colored accent is only on the left edge
- Background: `--color-surface-elevated`
- Auto-dismiss: 4000ms
- Progress bar: thin line at bottom, animates from 100%→0% over 4000ms
- Dismiss button: `×` icon, top-right, `color: --color-text-muted`

## 6.6 Empty States

- Max-width: `400px`, centered
- Icon or illustration: `48px`, `color: --color-text-muted`
- Headline: `--text-heading-md`, `color: --color-text-primary`
- Body: `--text-body-md`, `color: --color-text-secondary`
- CTA: Primary button, margin-top `--space-6`
- Padding: `--space-20` vertical

## 6.7 Skeleton Screens

- Match exact layout geometry of loaded content
- Border-radius must match the content it represents
- No text, no icons — shape only
- Shimmer: see Section 4.5
- Minimum skeleton duration before switching to content: 400ms (prevents flash of skeleton)

## 6.8 Loading Spinner

- Size: 20px (inline), 32px (standalone)
- Border-width: 2px
- Color: `border-color: --color-border; border-top-color: --color-primary`
- Animation: rotate 360° at `var(--duration-skeleton)` speed, linear
- Never centered on the full page — use skeleton screens instead

---

# SECTION 7: ACCESSIBILITY STANDARDS

| Standard | Requirement |
|---|---|
| Color Contrast (body text) | Minimum 4.5:1 against background (WCAG AA) |
| Color Contrast (large text, 18px+) | Minimum 3:1 |
| Color Contrast (UI components) | Minimum 3:1 for borders and icons against adjacent colors |
| Focus Indicators | Always visible on keyboard navigation, `:focus-visible` only |
| Touch Targets | Minimum 44×44px on mobile |
| Motion | `prefers-reduced-motion` collapses all animation durations to 0.01ms |
| Color reliance | No information conveyed by color alone — always paired with icon, text, or shape |
| ARIA | All interactive components have appropriate ARIA roles and labels |
| Form labels | Always explicit `<label for>`, never `placeholder` as a label |
| Screen reader | All decorative images `aria-hidden="true"`, all informative images have descriptive `alt` |
| Live regions | Toast notifications use `aria-live="polite"` |
| Error handling | Form errors announced to screen readers via `aria-describedby` |

---

# SECTION 8: RESPONSIVE DESIGN RULES

1. **Mobile-first:** All base styles are mobile. Media queries add complexity for larger screens.
2. **No horizontal scroll** at any breakpoint, ever.
3. **Touch targets:** Minimum 44×44px on screens below `md`.
4. **Font size floor:** 12px minimum on any platform.
5. **Cards:** Single column below `md`. Two columns at `md`. Three at `lg`.
6. **Navigation:** Full navbar above `md`. Hamburger + slide-in drawer below `md`.
7. **Tables:** Horizontally scrollable below `md`, with left shadow indicator showing scroll position.
8. **Forms:** Two-column grid above `sm`. Single column at `sm` and below.
9. **Hero:** Padding scales from `--space-12` on mobile to `--space-24` on desktop.
10. **Navbar height:** 56px on mobile, 64px on desktop.

---

# SECTION 9: IMPLEMENTATION PLAN

## Stage 1 — Stitch Screens (PENDING YOUR APPROVAL OF THIS DOCUMENT)

I will generate:
1. Home page — Light theme
2. Home page — Dark theme
3. Products page (with product cards, filter bar, and form) — Light theme
4. Products page — Dark theme

I will present all 4 screens. You approve or request revisions.

## Stage 2 — CSS Variables (after Stitch approval)

Complete rewrite of `globals.css`:
- All tokens as CSS custom properties
- Dual theme via `[data-theme="light"]` and `[data-theme="dark"]` on `<html>`
- System preference fallback via `@media (prefers-color-scheme: dark)`

## Stage 3 — Component Styles

Refactor all component CSS classes to match specifications.

## Stage 4 — Motion Implementation

CSS transitions and keyframe animations applied as documented.

## Stage 5 — Theme Toggle

Implement `ThemeToggle` component with:
- `localStorage` persistence
- System preference detection
- Animated icon switch
- 420ms cross-fade

---

# AWAITING YOUR APPROVAL

Please review this document and confirm:
1. **Color direction** — Warm Forest primary, Sienna Amber accent, espresso/walnut dark mode
2. **Typography** — Fraunces display + DM Sans body + JetBrains Mono for data
3. **Motion pacing** — Lamplight system (220ms base, spring easing for confirmations only)

Once you approve this spec, I will create the Stitch screens for review before writing any CSS.
