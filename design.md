# Design System Document: Precision Architect

## 1. Overview & Creative North Star
**Creative North Star: "Precision Architect"**

This design system values geometric clarity, structural depth, and warm minimalist tones. It moves the application away from the typical generic AI templates (neon blue-black base with screaming violet/magenta accents) into a curated digital interface. It balances clean typography with a primary sand gold accent that evokes the quiet confidence of physical architecture studios.

---

## 2. Colors & Surface Philosophy
The palette uses warm charcoal and muted earth tones to create a premium, legible, and tactile dark-mode experience.

### Color Roles
- **Primary (`#d8a473`):** "Sand Gold". Used for branding, hero accents, primary actions, and focused outlines.
- **Secondary/Success (`#7f8a7f`):** "Sage Green". Used for success messages, active tabs, and positive states (e.g. "In Stock").
- **Danger (`#d26b5c`):** "Terracotta Red". A earthy, muted brick-red used for errors, low-stock alerts, and destructive actions.
- **Base Background (`#121214`):** "Charcoal Base". The deepest foundation of the application.
- **Surface (`#19191c`):** "Slate Surface". Used for default cards, blocks, and dashboard feature panels.
- **Elevated Surface (`#212125`):** "High Slate". Used for popups, dropdown menus, and interactive form fields.

### The "No-Line" Rule
**Instruction**: Avoid using generic 1px solid border lines for section dividers. Divide sections by transitioning background colors (e.g., placing a `#19191c` card on a `#121214` page) or through generous vertical spacing.

---

## 3. Typography
We pair two distinct, modern typefaces to establish clear hierarchy:
- **Display & Headlines (Outfit):** Modern, wide geometric sans-serif from Google Fonts. Used for hero texts, page titles, and card headers.
- **Body & UI Labels (Inter):** Highly legible, crisp sans-serif used for input fields, descriptions, product pricing, and system status messages.

---

## 4. Elevation & Depth
We convey depth via container layering rather than heavy drop shadows:
- **Ambient Shadow**: When shadows are required (e.g., modals, tooltips), use a wide-spreading, highly diffuse shadow:
  - Blur: `32px`
  - Opacity: `5%`
  - Color: `#000000`

---

## 5. Components

### Buttons
- **Primary**: Pill or `8px` rounded shape. Background: `primary` (`#d8a473`), text: `#121214`.
- **Secondary**: Outlined or transparent container with `primary` text.
- **Destructive**: Earthy red tint background (`rgba(210, 107, 92, 0.15)`) with `danger` text (`#d26b5c`).

### Form Inputs
- **Base**: Muted dark container (`#1e1e22`) with no default border (or an extremely faint `rgba(255, 255, 255, 0.06)` outline).
- **Focus**: Transitions the border to `primary` (`#d8a473`) with a soft glowing gold shadow ring.

---

## 6. Do's and Don'ts

### Do:
- **Do** allow generous padding (minimum `24px` internal) to give typography breathing room.
- **Do** use Sage Green (`#7f8a7f`) for healthy status checks and success notifications.
- **Do** align components to a strict visual grid.

### Don't:
- **Don't** use pure black (`#000000`) or standard neon-glow elements.
- **Don't** use sharp `0px` borders; everything must have a subtle `8px` to `12px` radius to feel approachable.
