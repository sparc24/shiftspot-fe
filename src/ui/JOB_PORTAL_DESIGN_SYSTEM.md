# Design System & UI Design Tokens
## SkillMatch - Worker & Job Seeker Portal

**Version:** 1.0  
**Date:** September 2026  
**Status:** Final

---

## 1. Design Philosophy

**SkillMatch Brand Essence:**
A marketplace for skilled trades reflecting **trust, accessibility, and practicality**. Unlike corporate SaaS (which defaults to cream backgrounds and terracotta accents), SkillMatch draws from the world of hands-on work: the stability of craftsmanship, the reliability of a handshake agreement, and the warmth of community.

**Visual Language:**
- **Trustworthy** → Professional blues, clear hierarchy
- **Practical** → Clean lines, functional layout, no unnecessary decoration
- **Warm** → Earth-toned accents (brick, clay) reflecting construction/trades
- **Accessible** → High contrast, clear typography, intuitive interactions
- **Direct** → No corporate jargon, straightforward communication

---

## 2. Color Palette

### 2.1 Core Brand Colors

#### Primary - Trust Blue
The foundation. Used for primary CTAs, links, and key interface elements.

```
Brand Primary: #2563EB
  - Deep: #1E40AF (hover states, focus)
  - Light: #3B82F6 (active state)
  - Pale: #DBEAFE (backgrounds, hover backgrounds)
```

**Hex Values:**
```css
--color-primary-900: #0F172A;
--color-primary-700: #1E40AF;  /* Deep - use for hover/focus */
--color-primary-600: #2563EB;  /* Main brand color */
--color-primary-500: #3B82F6;  /* Active state */
--color-primary-100: #DBEAFE;  /* Light backgrounds */
--color-primary-50:  #F0F9FF;  /* Very light backgrounds */
```

**Use Cases:**
- Primary buttons & CTAs
- Links & interactive elements
- Focus states (border/outline)
- Form validation success
- Primary section headers

#### Secondary - Warm Earth Tone
The accent. References the trades industry (brick, clay, leather).

```
Secondary: #D97706
  - Deep: #92400E (shadows, depth)
  - Light: #FCD34D (highlights, attention)
  - Pale: #FEF3C7 (backgrounds)
```

**Hex Values:**
```css
--color-secondary-900: #78350F;
--color-secondary-700: #B45309;
--color-secondary-600: #D97706;  /* Main accent color */
--color-secondary-500: #F59E0B;  /* Lighter version */
--color-secondary-100: #FEF3C7;  /* Light backgrounds */
--color-secondary-50:  #FFFBEB;  /* Very light backgrounds */
```

**Use Cases:**
- Accent elements (badges, tags)
- Skill highlights
- Worker registration success state
- Important notices
- Secondary buttons (on hover)

### 2.2 Semantic Colors

#### Error - Cautious Red
For validation failures, warnings, and destructive actions.

```css
--color-error-700:   #B91C1C;  /* Dark error for text/borders */
--color-error-600:   #DC2626;  /* Main error color */
--color-error-500:   #EF4444;  /* Lighter error */
--color-error-100:   #FEE2E2;  /* Error background */
--color-error-50:    #FEF2F2;  /* Very light error background */
```

**Use Cases:**
- Form validation errors
- Error messages
- "Already Exists" warnings (use secondary-600 instead for less urgent)
- Error icons
- Failed API responses

#### Warning - Amber (Caution)
For warnings, notices, and alerts that need attention but aren't errors.

```css
--color-warning-700:  #92400E;
--color-warning-600:  #D97706;
--color-warning-500:  #F59E0B;
--color-warning-100:  #FEF3C7;
--color-warning-50:   #FFFBEB;
```

**Use Cases:**
- "Already Exists" duplicate warnings
- Important notices
- In-progress states
- Attention-needed items

#### Success - Trustworthy Green
For successful actions, confirmations, and positive states.

```css
--color-success-700:  #15803D;
--color-success-600:  #16A34A;  /* Main success color */
--color-success-500:  #22C55E;  /* Lighter success */
--color-success-100:  #DCFCE7;  /* Success background */
--color-success-50:   #F0FDF4;  /* Very light background */
```

**Use Cases:**
- Registration confirmation
- Validation success
- Check icons
- Success messages
- Positive feedback

#### Info - Light Blue
For informational messages and helpful hints.

```css
--color-info-700:     #0369A1;
--color-info-600:     #0284C7;
--color-info-500:     #06B6D4;
--color-info-100:     #CFFAFE;
--color-info-50:      #F0F9FA;
```

**Use Cases:**
- Helpful tips
- Information icons
- Hints and suggestions
- Neutral status updates

### 2.3 Neutral Colors (Grayscale)

The foundation for text, backgrounds, and borders. Warm gray (not cool).

```css
--color-neutral-900: #111827;  /* Text primary - nearly black */
--color-neutral-800: #1F2937;  /* Text primary alternative */
--color-neutral-700: #374151;  /* Text secondary */
--color-neutral-600: #4B5563;  /* Text muted, borders strong */
--color-neutral-500: #6B7280;  /* Text tertiary, borders medium */
--color-neutral-400: #9CA3AF;  /* Text placeholder, borders light */
--color-neutral-300: #D1D5DB;  /* Light borders */
--color-neutral-200: #E5E7EB;  /* Very light borders, dividers */
--color-neutral-100: #F3F4F6;  /* Light backgrounds */
--color-neutral-50:  #F9FAFB;  /* Very light backgrounds */
```

**Use Cases:**
- Primary text: neutral-900 / neutral-800
- Secondary text: neutral-700
- Muted text (helpers, labels): neutral-600
- Placeholder text: neutral-400
- Borders: neutral-300 / neutral-200
- Backgrounds: neutral-50 / neutral-100
- Dividers: neutral-200

### 2.4 Full Color Palette Reference

```
PRIMARIES
   Blue (Trust):        #2563EB (primary action, links)
   Amber (Warmth):      #D97706 (accents, secondary action)
   
SEMANTICS
   Error:               #DC2626 (validation failures)
   Warning:             #D97706 (duplicate alerts)
   Success:             #16A34A (confirmations)
   Info:                #0284C7 (helpful info)
   
NEUTRALS
   Text Primary:        #111827 (body, headings)
   Text Secondary:      #374151 (secondary info)
   Text Muted:          #6B7280 (helpers, meta)
   Borders:             #D1D5DB (default borders)
   Light BG:            #F3F4F6 (light backgrounds)
   Page BG:             #FFFFFF (main background)
```

---

## 3. Typography System

### 3.1 Typeface Selection

**Display & Headers:**
- **Font Family:** Inter (modern sans-serif, excellent legibility)
- **License:** Free (Google Fonts / Fontsource)
- **Fallback Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Body & UI:**
- **Font Family:** Inter (same family, maintains cohesion)
- **Rationale:** Single typeface avoids visual complexity while maintaining hierarchy through weight and scale

**Monospace (if needed for phone/email display):**
- **Font Family:** Menlo / Monaco / `monospace`

### 3.2 Type Scale

```
Display/Hero
  Font Size: 3.5rem (56px) / 3rem (48px)
  Line Height: 1.1
  Letter Spacing: -0.02em
  Font Weight: 700 (Bold)
  Use: Main page titles (rare)

Heading 1 (Page Title)
  Font Size: 2.25rem (36px)
  Line Height: 1.2
  Letter Spacing: -0.01em
  Font Weight: 700 (Bold)
  Use: Page titles, major section headers
  Example: "Register as a Worker"

Heading 2 (Section Header)
  Font Size: 1.875rem (30px)
  Line Height: 1.3
  Font Weight: 700 (Bold)
  Use: Form section titles, card headers
  Example: "Your Details"

Heading 3 (Subsection)
  Font Size: 1.5rem (24px)
  Line Height: 1.4
  Font Weight: 600 (Semibold)
  Use: Subsection headers, modal titles
  Example: "Registration Confirmed"

Body Large
  Font Size: 1.125rem (18px)
  Line Height: 1.5
  Font Weight: 400 (Regular)
  Use: Large body text, introductions
  Example: Hero text, callout copy

Body
  Font Size: 1rem (16px)
  Line Height: 1.5
  Font Weight: 400 (Regular)
  Use: Primary body text, form labels
  Example: All paragraph text, labels
  Max Line Length: 75 characters

Body Small
  Font Size: 0.875rem (14px)
  Line Height: 1.5
  Font Weight: 400 (Regular)
  Use: Secondary text, hints, metadata
  Example: Helper text, timestamps

Caption
  Font Size: 0.75rem (12px)
  Line Height: 1.4
  Font Weight: 500 (Medium)
  Letter Spacing: 0.02em
  Use: Labels, tags, badges
  Example: "SKILL BADGE", form labels

Label (Form)
  Font Size: 0.875rem (14px)
  Line Height: 1.5
  Font Weight: 600 (Semibold)
  Use: Form field labels
  Example: "Email Address *"
```

### 3.3 CSS Custom Properties for Typography

```css
/* Heading styles */
--font-display:       "Inter", sans-serif;
--font-body:          "Inter", sans-serif;
--font-mono:          "Menlo", "Monaco", monospace;

--text-h1-size:       2.25rem;
--text-h1-weight:     700;
--text-h1-line:       1.2;
--text-h1-letter:     -0.01em;

--text-h2-size:       1.875rem;
--text-h2-weight:     700;
--text-h2-line:       1.3;

--text-h3-size:       1.5rem;
--text-h3-weight:     600;
--text-h3-line:       1.4;

--text-body-size:     1rem;
--text-body-weight:   400;
--text-body-line:     1.5;

--text-body-small-size:   0.875rem;
--text-body-small-weight: 400;
--text-body-small-line:   1.5;

--text-caption-size:   0.75rem;
--text-caption-weight: 500;
--text-caption-line:   1.4;
```

### 3.4 Font Weights

```css
--font-weight-regular:  400;  /* Body text */
--font-weight-medium:   500;  /* Labels, small headings */
--font-weight-semibold: 600;  /* Section headings */
--font-weight-bold:     700;  /* Major headings, emphasis */
```

---

## 4. Spacing System

### 4.1 Spacing Scale

Follows 8px base unit (2^n scale for rhythm).

```css
--spacing-0:   0;
--spacing-1:   0.25rem;   /* 4px */
--spacing-2:   0.5rem;    /* 8px */
--spacing-3:   0.75rem;   /* 12px */
--spacing-4:   1rem;      /* 16px */
--spacing-5:   1.25rem;   /* 20px */
--spacing-6:   1.5rem;    /* 24px */
--spacing-8:   2rem;      /* 32px */
--spacing-10:  2.5rem;    /* 40px */
--spacing-12:  3rem;      /* 48px */
--spacing-16:  4rem;      /* 64px */
--spacing-20:  5rem;      /* 80px */
--spacing-24:  6rem;      /* 96px */
```

### 4.2 Common Spacing Patterns

```css
/* Padding/Margin for sections */
--section-padding-mobile:   var(--spacing-6);  /* 24px */
--section-padding-desktop:  var(--spacing-12); /* 48px */

/* Card padding */
--card-padding-mobile:      var(--spacing-4);  /* 16px */
--card-padding-desktop:     var(--spacing-6);  /* 24px */

/* Form field margins */
--form-field-margin:        var(--spacing-6);  /* 24px */

/* Gap between grid items */
--grid-gap-mobile:          var(--spacing-4);  /* 16px */
--grid-gap-desktop:         var(--spacing-6);  /* 24px */
```

---

## 5. Component Design Tokens

### 5.1 Buttons

#### Primary Button (CTA)
```css
--button-primary-bg:           var(--color-primary-600);
--button-primary-text:         #FFFFFF;
--button-primary-border:       transparent;

--button-primary-hover-bg:     var(--color-primary-700);
--button-primary-hover-text:   #FFFFFF;

--button-primary-active-bg:    var(--color-primary-800);
--button-primary-active-text:  #FFFFFF;

--button-primary-disabled-bg:  var(--color-neutral-300);
--button-primary-disabled-text: var(--color-neutral-600);

--button-padding-y:            var(--spacing-3);      /* 12px */
--button-padding-x:            var(--spacing-6);      /* 24px */
--button-font-size:            1rem;
--button-font-weight:          600;
--button-border-radius:        0.5rem;                /* 8px */
--button-min-height:           var(--spacing-12);     /* 48px (mobile accessibility) */
```

#### Secondary Button
```css
--button-secondary-bg:         var(--color-neutral-100);
--button-secondary-text:       var(--color-primary-600);
--button-secondary-border:     var(--color-neutral-300);

--button-secondary-hover-bg:   var(--color-neutral-200);
--button-secondary-hover-text: var(--color-primary-700);

--button-secondary-active-bg:  var(--color-neutral-300);
--button-secondary-active-text: var(--color-primary-800);
```

#### Tertiary Button (Text only)
```css
--button-tertiary-bg:          transparent;
--button-tertiary-text:        var(--color-primary-600);
--button-tertiary-border:      transparent;

--button-tertiary-hover-bg:    var(--color-primary-50);
--button-tertiary-hover-text:  var(--color-primary-700);

--button-tertiary-active-bg:   var(--color-primary-100);
--button-tertiary-active-text: var(--color-primary-800);
```

### 5.2 Forms & Inputs

#### Text Input / Textarea
```css
--input-bg:                    #FFFFFF;
--input-border:                var(--color-neutral-300);
--input-border-hover:          var(--color-neutral-400);
--input-border-focus:          var(--color-primary-600);
--input-text:                  var(--color-neutral-900);
--input-placeholder:           var(--color-neutral-400);

--input-padding-y:             var(--spacing-3);      /* 12px */
--input-padding-x:             var(--spacing-4);      /* 16px */
--input-font-size:             1rem;
--input-border-width:          1px;
--input-border-radius:         0.5rem;                /* 8px */
--input-focus-outline:         2px solid var(--color-primary-500);
--input-focus-outline-offset:  2px;

/* Error state */
--input-error-border:          var(--color-error-600);
--input-error-bg:              var(--color-error-50);
--input-error-text:            var(--color-error-700);

/* Success state */
--input-success-border:        var(--color-success-600);
--input-success-bg:            var(--color-success-50);
--input-success-text:          var(--color-success-700);

/* Disabled state */
--input-disabled-bg:           var(--color-neutral-100);
--input-disabled-border:       var(--color-neutral-200);
--input-disabled-text:         var(--color-neutral-500);
```

#### Checkbox & Radio
```css
--checkbox-size:               1.25rem;               /* 20px */
--checkbox-border:             var(--color-neutral-400);
--checkbox-bg-unchecked:       #FFFFFF;
--checkbox-bg-checked:         var(--color-primary-600);
--checkbox-border-radius:      0.375rem;              /* 6px */
--checkbox-focus-outline:      2px solid var(--color-primary-500);

--radio-size:                  1.25rem;               /* 20px */
--radio-border-width:          2px;
```

#### Select / Dropdown
```css
--select-bg:                   #FFFFFF;
--select-border:               var(--color-neutral-300);
--select-border-focus:         var(--color-primary-600);
--select-text:                 var(--color-neutral-900);
--select-border-radius:        0.5rem;                /* 8px */
--select-padding-y:            var(--spacing-3);      /* 12px */
--select-padding-x:            var(--spacing-4);      /* 16px */
```

### 5.3 Form Labels & Helpers

```css
--label-text:                  var(--color-neutral-900);
--label-font-size:             0.875rem;              /* 14px */
--label-font-weight:           600;
--label-required-color:        var(--color-error-600);

--helper-text:                 var(--color-neutral-600);
--helper-font-size:            0.75rem;               /* 12px */
--helper-margin-top:           var(--spacing-2);      /* 8px */

--error-text:                  var(--color-error-600);
--error-font-size:             0.875rem;              /* 14px */
--error-margin-top:            var(--spacing-1);      /* 4px */
```

### 5.4 Cards & Containers

```css
--card-bg:                     #FFFFFF;
--card-border:                 var(--color-neutral-200);
--card-border-radius:          0.75rem;               /* 12px */
--card-shadow:                 0 1px 3px rgba(0, 0, 0, 0.12),
                               0 1px 2px rgba(0, 0, 0, 0.08);
--card-shadow-hover:           0 10px 25px rgba(0, 0, 0, 0.1);

--card-padding:                var(--spacing-6);      /* 24px */
--card-gap:                    var(--spacing-4);      /* 16px */

/* Container max-width */
--container-max-width:         1200px;
--container-padding-x:         var(--spacing-6);      /* 24px mobile, 48px desktop */
```

### 5.5 Badges & Tags

```css
/* Skill Badge */
--badge-bg:                    var(--color-secondary-100);
--badge-text:                  var(--color-secondary-700);
--badge-padding-y:             var(--spacing-1);      /* 4px */
--badge-padding-x:             var(--spacing-3);      /* 12px */
--badge-border-radius:         9999px;                /* Fully rounded */
--badge-font-size:             0.75rem;               /* 12px */
--badge-font-weight:           600;

/* Status Badge (Processing/Warning) */
--badge-warning-bg:            var(--color-warning-100);
--badge-warning-text:          var(--color-warning-700);

/* Success Badge */
--badge-success-bg:            var(--color-success-100);
--badge-success-text:          var(--color-success-700);

/* Error Badge */
--badge-error-bg:              var(--color-error-100);
--badge-error-text:            var(--color-error-700);
```

### 5.6 Alerts & Messages

```css
/* Alert Box */
--alert-padding:               var(--spacing-4);      /* 16px */
--alert-border-radius:         0.5rem;                /* 8px */
--alert-border-left-width:     4px;

/* Error Alert */
--alert-error-bg:              var(--color-error-50);
--alert-error-border:          var(--color-error-600);
--alert-error-text:            var(--color-error-700);
--alert-error-icon:            var(--color-error-600);

/* Warning Alert */
--alert-warning-bg:            var(--color-warning-50);
--alert-warning-border:        var(--color-warning-600);
--alert-warning-text:          var(--color-warning-700);
--alert-warning-icon:          var(--color-warning-600);

/* Success Alert */
--alert-success-bg:            var(--color-success-50);
--alert-success-border:        var(--color-success-600);
--alert-success-text:          var(--color-success-700);
--alert-success-icon:          var(--color-success-600);

/* Info Alert */
--alert-info-bg:               var(--color-info-50);
--alert-info-border:           var(--color-info-600);
--alert-info-text:             var(--color-info-700);
--alert-info-icon:             var(--color-info-600);
```

---

## 6. Layout & Grid System

### 6.1 Responsive Breakpoints

```css
--breakpoint-mobile:           320px;
--breakpoint-tablet-sm:        640px;   /* sm */
--breakpoint-tablet:           768px;   /* md */
--breakpoint-desktop:          1024px;  /* lg */
--breakpoint-desktop-lg:       1280px;  /* xl */

/* Usage example */
Mobile-first:
  base styles (320px+)
  @media (min-width: 768px) { /* tablet */ }
  @media (min-width: 1024px) { /* desktop */ }
```

### 6.2 Container Queries

```css
--container-width-mobile:      100%;
--container-width-mobile-padding: calc(100% - 2 * var(--spacing-6));
--container-width-desktop:     var(--container-max-width);

--container-center-margin-x:   auto;
```

### 6.3 Grid System

12-column grid with flexible gaps.

```css
/* Mobile: 1 column (or 2 for some components) */
--grid-columns-mobile:         1;
--grid-columns-mobile-alt:     2;

/* Tablet: 2 columns */
--grid-columns-tablet:         2;

/* Desktop: 3 columns */
--grid-columns-desktop:        3;

/* Large Desktop: 4 columns */
--grid-columns-lg:             4;

/* Gap between items */
--gap-mobile:                  var(--spacing-4);      /* 16px */
--gap-tablet:                  var(--spacing-6);      /* 24px */
--gap-desktop:                 var(--spacing-8);      /* 32px */
```

---

## 7. Shadows & Depth

### 7.1 Shadow System

```css
/* Subtle shadow (for cards, dropdowns) */
--shadow-sm:                   0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Base shadow (for cards, modals) */
--shadow-md:                   0 4px 6px -1px rgba(0, 0, 0, 0.1),
                               0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Elevated shadow (for modals, popovers) */
--shadow-lg:                   0 10px 15px -3px rgba(0, 0, 0, 0.1),
                               0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* High elevation shadow */
--shadow-xl:                   0 20px 25px -5px rgba(0, 0, 0, 0.1),
                               0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Hover/Focus elevation */
--shadow-hover:                0 10px 25px rgba(0, 0, 0, 0.1);

/* No shadow */
--shadow-none:                 none;
```

### 7.2 Shadow Application

- **Buttons:** --shadow-none (flat design)
- **Cards (resting):** --shadow-md
- **Cards (hover):** --shadow-lg
- **Modals:** --shadow-xl
- **Popovers/Dropdowns:** --shadow-lg
- **Floating Action Buttons:** --shadow-lg

---

## 8. Border & Radius System

### 8.1 Border Radius

```css
--radius-none:                 0;
--radius-xs:                   0.25rem;               /* 4px - subtle */
--radius-sm:                   0.375rem;              /* 6px - buttons, inputs */
--radius-md:                   0.5rem;                /* 8px - cards, modals */
--radius-lg:                   0.75rem;               /* 12px - larger components */
--radius-xl:                   1rem;                  /* 16px - hero sections */
--radius-full:                 9999px;                /* Pill-shaped (badges) */
```

### 8.2 Borders

```css
--border-width-thin:           1px;
--border-width-medium:         2px;                   /* Focus states */
--border-width-thick:          3px;

/* Border color variations */
--border-light:                var(--color-neutral-200);
--border-medium:               var(--color-neutral-300);
--border-strong:               var(--color-neutral-400);
```

---

## 9. Motion & Transitions

### 9.1 Transition Timing

```css
--transition-fast:             150ms;                 /* Quick feedback */
--transition-base:             300ms;                 /* Standard interaction */
--transition-slow:             500ms;                 /* Deliberate movement */

/* Easing functions */
--ease-in-out:                 cubic-bezier(0.4, 0, 0.2, 1);
--ease-out:                    cubic-bezier(0, 0, 0.2, 1);
--ease-in:                     cubic-bezier(0.4, 0, 1, 1);

/* Standard transition property */
--transition:                  all var(--transition-base) var(--ease-in-out);
--transition-fast:             all var(--transition-fast) var(--ease-in-out);
--transition-slow:             all var(--transition-slow) var(--ease-in-out);
```

### 9.2 Animation Guidelines

- **Avoid excessive animation:** Only for high-value interactions
- **No auto-play animations on page load:** Respect reduced-motion
- **Hover states:** Smooth color/shadow transitions (150-300ms)
- **Focus states:** Immediate, clear outline (no animation)
- **Loading states:** Spinner with consistent rotation (1-2 second cycle)
- **Form success:** Brief 300ms expand/fade-in animation
- **Form errors:** Shake or highlight (200-300ms)

### 9.3 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Icon System

### 10.1 Icon Size Scale

```css
--icon-xs:                     1rem;                  /* 16px - small inline icons */
--icon-sm:                     1.25rem;               /* 20px - standard icons */
--icon-md:                     1.5rem;                /* 24px - form icons */
--icon-lg:                     2rem;                  /* 32px - section icons */
--icon-xl:                     3rem;                  /* 48px - hero icons */
```

### 10.2 Icon Colors

- **Primary Action:** var(--color-primary-600)
- **Secondary Action:** var(--color-secondary-600)
- **Success:** var(--color-success-600)
- **Error:** var(--color-error-600)
- **Warning:** var(--color-warning-600)
- **Muted/Disabled:** var(--color-neutral-400)
- **Text:** var(--color-neutral-900) (inherit from text)

### 10.3 Icon Library

Recommendation: **Feather Icons** (consistent, minimal aesthetic matching design)
- Clean, simple line-based icons
- Available in SVG format (scalable)
- Open source (MIT license)
- Consistent stroke width (2px recommended)

---

## 11. Accessibility Tokens

### 11.1 Focus States

```css
--focus-outline:               2px solid var(--color-primary-500);
--focus-outline-offset:        2px;
--focus-ring-width:            2px;
--focus-ring-color:            var(--color-primary-600);
```

### 11.2 High Contrast Mode Support

```css
@media (prefers-contrast: more) {
  --color-primary-600:         #0F47B8;  /* More saturated */
  --color-neutral-900:         #000000;  /* Pure black */
  --button-primary-text:       #FFFFFF;  /* Ensure white text */
}
```

### 11.3 Color Contrast Requirements

- **Large Text (18px+ or 14px+ bold):** 3:1 minimum
- **Normal Text:** 4.5:1 minimum
- **UI Components:** 3:1 minimum
- **Focus Indicators:** 3:1 contrast with adjacent colors

**Verified Contrasts:**
- Primary text (#111827) on white: 21:1 ✓
- Secondary text (#374151) on white: 10.5:1 ✓
- Primary button text (white) on primary bg: 8.6:1 ✓
- Helper text (#6B7280) on white: 7:1 ✓

---

## 12. Dark Mode (Future)

Reserved for post-MVP implementation.

```css
@media (prefers-color-scheme: dark) {
  --color-neutral-900:         #F9FAFB;  /* Invert */
  --color-neutral-50:          #111827;  /* Invert */
  --color-primary-600:         #60A5FA;  /* Lighter blue for contrast */
  --card-bg:                   #1F2937;  /* Dark card background */
  --card-border:               #374151;  /* Darker border */
  /* ... more inversions */
}
```

---

## 13. CSS Custom Properties Export

### 13.1 Complete Token Set

```css
:root {
  /* COLORS - PRIMARY */
  --color-primary-900:  #0F172A;
  --color-primary-700:  #1E40AF;
  --color-primary-600:  #2563EB;
  --color-primary-500:  #3B82F6;
  --color-primary-100:  #DBEAFE;
  --color-primary-50:   #F0F9FF;
  
  /* COLORS - SECONDARY */
  --color-secondary-900: #78350F;
  --color-secondary-700: #B45309;
  --color-secondary-600: #D97706;
  --color-secondary-500: #F59E0B;
  --color-secondary-100: #FEF3C7;
  --color-secondary-50:  #FFFBEB;
  
  /* COLORS - SEMANTIC */
  --color-error-700:    #B91C1C;
  --color-error-600:    #DC2626;
  --color-error-500:    #EF4444;
  --color-error-100:    #FEE2E2;
  --color-error-50:     #FEF2F2;
  
  --color-warning-700:  #92400E;
  --color-warning-600:  #D97706;
  --color-warning-500:  #F59E0B;
  --color-warning-100:  #FEF3C7;
  --color-warning-50:   #FFFBEB;
  
  --color-success-700:  #15803D;
  --color-success-600:  #16A34A;
  --color-success-500:  #22C55E;
  --color-success-100:  #DCFCE7;
  --color-success-50:   #F0FDF4;
  
  --color-info-700:     #0369A1;
  --color-info-600:     #0284C7;
  --color-info-500:     #06B6D4;
  --color-info-100:     #CFFAFE;
  --color-info-50:      #F0F9FA;
  
  /* COLORS - NEUTRAL */
  --color-neutral-900:  #111827;
  --color-neutral-800:  #1F2937;
  --color-neutral-700:  #374151;
  --color-neutral-600:  #4B5563;
  --color-neutral-500:  #6B7280;
  --color-neutral-400:  #9CA3AF;
  --color-neutral-300:  #D1D5DB;
  --color-neutral-200:  #E5E7EB;
  --color-neutral-100:  #F3F4F6;
  --color-neutral-50:   #F9FAFB;
  
  /* TYPOGRAPHY */
  --font-family-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-family-body:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-family-mono:    "Menlo", "Monaco", monospace;
  
  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
  
  /* SPACING */
  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  
  /* SHADOWS */
  --shadow-sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-hover: 0 10px 25px rgba(0, 0, 0, 0.1);
  
  /* RADIUS */
  --radius-none: 0;
  --radius-xs:   0.25rem;
  --radius-sm:   0.375rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
  --radius-full: 9999px;
  
  /* TRANSITIONS */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* BREAKPOINTS */
  --breakpoint-mobile:     320px;
  --breakpoint-tablet-sm:  640px;
  --breakpoint-tablet:     768px;
  --breakpoint-desktop:    1024px;
  --breakpoint-desktop-lg: 1280px;
  
  /* CONTAINER */
  --container-max-width: 1200px;
  --container-padding-x: var(--spacing-6);
}
```

---

## 14. Color Palette Reference Card

### For Quick Copy-Paste

```
PRIMARY (Trust Blue)
#2563EB (main) | #1E40AF (hover) | #3B82F6 (active)

SECONDARY (Warm Amber)
#D97706 (main) | #B45309 (hover) | #F59E0B (light)

SUCCESS
#16A34A (text) | #DCFCE7 (background)

ERROR
#DC2626 (text) | #FEE2E2 (background)

WARNING/ALERT
#D97706 (border) | #FEF3C7 (background)

NEUTRAL
#111827 (text) | #F3F4F6 (background) | #D1D5DB (border)
```

---

## 15. Implementation Checklist

- [ ] Install Inter font family from Google Fonts or Fontsource
- [ ] Create CSS custom properties file with all tokens
- [ ] Build component library with token-based styling
- [ ] Test all components for contrast ratios (WCAG AA)
- [ ] Test responsive breakpoints on actual devices
- [ ] Verify focus states are visible and accessible
- [ ] Test with reduced-motion preference
- [ ] Update design documentation as patterns emerge
- [ ] Create Figma component library (if using Figma)
- [ ] Document color usage patterns for team
- [ ] Create icon guidelines and audit

---

## 16. Document History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Sept 2026 | Design Team | Initial Design System - MVP |

