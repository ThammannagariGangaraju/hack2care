# HACK2CARE - Emergency First Aid Assistant Design Guidelines

## Design Approach
**Reference-Based:** Emergency services apps (pulse.eco, emergency.org) + Material Design principles for high-stress scenarios
**Core Principle:** Panic-safe, instant-action design with maximum visibility and zero cognitive load

## Typography System
- **Primary Font:** Inter or Roboto (Google Fonts CDN) - maximum legibility under stress
- **Headline:** font-bold text-4xl to text-6xl for primary CTA
- **Body:** font-medium text-lg to text-xl (never smaller than 16px)
- **Emergency Instructions:** font-semibold text-xl with increased line-height (1.6)
- **Button Text:** font-bold text-2xl uppercase for primary actions

## Layout & Spacing
**Spacing Units:** Tailwind units of 4, 6, 8, 12, 16 (p-4, m-8, gap-6, etc.)
- Mobile-first with generous touch targets (minimum 60px height for all buttons)
- Single column layout throughout - no multi-column grids
- Full viewport sections with centered content
- Maximum content width: max-w-lg (keeps text readable, buttons tappable)

## Component Library

### Landing Page
- **Hero Button:** Full-width, h-32 minimum, rounded-2xl, with pulsing shadow effect
- **Text Hierarchy:** App name (text-3xl), tagline (text-lg), emergency number visible but secondary

### Decision Tree Questions
- **Question Cards:** Large cards with p-8, shadow-2xl, rounded-3xl
- **Yes/No Buttons:** Side-by-side, equal width, h-24, with clear icons (✓ and ✗)
- **Progress Indicator:** Simple 1/3, 2/3, 3/3 at top

### CPR Animation Section
- **Animation Container:** Centered, max-w-md, aspect-square background card
- **Count Display:** Massive text-8xl numerals overlaid on animation, changing color per beat
- **Timer:** Prominent seconds counter (text-3xl) below count
- **Visual:** Animated SVG or Lottie of two human figures - one lying flat, one performing compressions
- **Warning Banner:** Above animation with icon, font-bold, explaining "Only if trained"

### Emergency Actions
- **Call Buttons:** Full-width, h-20, with phone icon left, number right, subtle gradient
- **WhatsApp/SMS Section:** 
  - Instruction text first: "Share your location:" (text-xl, font-semibold)
  - Both buttons side-by-side with icons and labels
  - Helper text below: "Tap to send emergency message with your location"

### Maps & Locations
- **Section Headers:** text-3xl font-bold with emergency icon, not small text
- **Hospital/Medical Shop Cards:** 
  - h-24 minimum per card
  - Name (text-xl font-bold), distance (text-lg), "Open in Maps" button (h-16, prominent)
- **Current Location Marker:** Always visible on embedded maps with distinct red pin icon
- **Maps Button:** Bright, contrasting color, text-xl font-bold, w-full

### First Aid Instructions (Gemini Output)
- **Container:** White/light card with shadow-xl, p-6, rounded-2xl
- **Bullet Points:** Large checkmark icons, text-xl, generous spacing (space-y-4)
- **Voice Icon:** Animated speaker icon at top indicating auto-reading

### Offline Mode
- **Banner:** Full-width sticky notification with offline icon
- **Cached Guide:** Same styling as Gemini output, clearly labeled "Standard First Aid Guide"

## Color Strategy (Emergency Theme)
While colors are defined later, structural notes:
- Primary actions use emergency red treatment
- Secondary actions use high-visibility yellow treatment
- Safe/confirmation actions use white with strong borders
- Background maintains maximum contrast for outdoor visibility
- All text meets WCAA AAA standards for contrast

## Interactions & Animations
- **Minimal Motion:** Only essential feedback (button press states, loading spinners)
- **CPR Animation:** Smooth, medical-accurate compression rhythm at 100-120 BPM
- **Count Animation:** Number scales up on each beat, then fades
- **No decorative animations:** Every motion serves immediate function

## Accessibility
- Touch targets: minimum 60px × 60px
- Focus states: thick 4px outlines on all interactive elements
- Screen reader labels on all buttons and actions
- Auto-voice playback for critical instructions
- Works in bright sunlight and low-light conditions

## Images
**No hero images** - this is action-first emergency UI
**CPR Animation:** Custom animated SVG or Lottie file showing clear side-view of two human figures with compression motion, integrated count overlay, and breathing indicator

**Critical Implementation Notes:**
- Everything loads in under 3 seconds on 3G
- All primary actions visible without scrolling
- No hamburger menus - everything is always visible
- Portrait orientation lock enforced
- Service Worker caches all essential assets for offline use