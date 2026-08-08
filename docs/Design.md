# 🎨 DESIGN SYSTEM
## Sign Language Bridge - UI/UX Guidelines

---

## 1. DESIGN PHILOSOPHY

### Core Principles:
1. **Simplicity** - Minimal interface, maximum clarity
2. **Accessibility** - Works for everyone
3. **Real-time Feedback** - Immediate visual confirmation
4. **Intuitiveness** - No learning curve

---

## 2. COLOR PALETTE

### Primary Colors
```
Primary Blue:     #3B82F6    (Main actions)
Primary Green:    #10B981    (Success, positive)
Primary Red:      #EF4444    (Danger, warnings)
Primary Purple:   #8B5CF6    (Highlights)
```

### Neutral Colors
```
White:            #FFFFFF    (Background)
Light Gray:       #F3F4F6    (Secondary background)
Medium Gray:      #9CA3AF    (Borders, dividers)
Dark Gray:        #374151    (Text secondary)
Black:            #111827    (Text primary)
```

### Semantic Colors
```
Success:          #10B981 (Green) - Recognition successful
Warning:          #F59E0B (Orange) - Low confidence
Error:            #EF4444 (Red) - Error states
Info:             #3B82F6 (Blue) - Informational
```

---

## 3. TYPOGRAPHY

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
```

### Font Sizes & Weights

**Headings:**
```
H1: 36px, Bold (700)     - Page titles
H2: 28px, Bold (700)     - Section headers
H3: 24px, Semibold (600) - Subsections
H4: 20px, Semibold (600) - Component headers
```

**Body Text:**
```
Body Large:  16px, Regular (400) - Main content
Body Medium: 14px, Regular (400) - Secondary content
Body Small:  12px, Regular (400) - Help text, captions
```

**Special:**
```
Mono:        14px, Regular      - Code, predictions, metrics
Button:      14px, Semibold (600)
```

---

## 4. SPACING SYSTEM

```
0:    0px
1:    4px
2:    8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
```

**Usage:**
```
Padding:     2-4 (8-16px)
Margin:      3-6 (12-24px)
Gap (Flex):  3-4 (12-16px)
Border Rad:  2-4 (8-16px)
```

---

## 5. COMPONENT STYLES

### Buttons

```jsx
// Primary Button (Main action)
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
  Start Camera
</button>

// Secondary Button
<button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
  Settings
</button>

// Danger Button
<button className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition">
  Clear
</button>

// Button Sizes:
// Small:   px-3 py-1 text-sm
// Medium:  px-4 py-2 text-base (default)
// Large:   px-6 py-3 text-lg
```

### Input Fields

```jsx
// Text Input
<input
  type="text"
  placeholder="Type here..."
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
/>

// Focus State:
// border-blue-500 ring-2 ring-blue-200
```

### Cards

```jsx
// Card
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <h3 className="font-semibold text-gray-900">Title</h3>
  <p className="text-gray-600 mt-2">Content here</p>
</div>

// Card with hover:
// hover:shadow-md transition-shadow
```

### Modals

```jsx
// Modal Overlay
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
    <h2 className="text-xl font-bold mb-4">Modal Title</h2>
    <p className="text-gray-600 mb-6">Content</p>
    <div className="flex gap-2 justify-end">
      <button className="btn-secondary">Cancel</button>
      <button className="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

---

## 6. LAYOUT STRUCTURE

### Main Layout

```
┌─────────────────────────────────────┐
│          HEADER                     │
├─────────────────────────────────────┤
│  SIDEBAR  │     MAIN CONTENT        │
│           │                         │
│  • Nav    │  ┌─────────────────┐   │
│  • Links  │  │ Camera/Content  │   │
│           │  └─────────────────┘   │
│           │  ┌─────────────────┐   │
│           │  │ Predictions     │   │
│           │  └─────────────────┘   │
├─────────────────────────────────────┤
│          FOOTER                     │
└─────────────────────────────────────┘
```

### Responsive Breakpoints (Tailwind)

```
sm: 640px   (Mobile landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
```

---

## 7. ICON SYSTEM

### Icon Set: Heroicons or Feather Icons

```jsx
// Camera Icon
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>

// Icon Sizes:
// Small:  w-4 h-4
// Medium: w-6 h-6
// Large:  w-8 h-8
```

---

## 8. ANIMATION & TRANSITIONS

### Smooth Transitions

```css
/* Default transition */
transition: all 0.3s ease-in-out;

/* Specific properties */
transition-property: background-color, border-color;
transition-duration: 0.2s;
transition-timing-function: ease-out;
```

### Common Animations

```jsx
// Fade in
<div className="opacity-0 animate-fadeIn">...</div>

// Slide up
<div className="transform -translate-y-2 animate-slideUp">...</div>

// Pulse (loading)
<div className="animate-pulse">...</div>

// Bounce (attention)
<div className="animate-bounce">...</div>
```

---

## 9. ACCESSIBILITY GUIDELINES

### Color Contrast
```
Normal Text:     4.5:1 (AAA)
Large Text:      3:1 (AA)
UI Components:   3:1 (AA)
```

### Touch Targets
```
Minimum size:    44x44px (mobile)
Recommended:     48x48px
Spacing:         8px between targets
```

### Keyboard Navigation
```
Tab:        Move to next element
Shift+Tab:  Move to previous element
Enter:      Activate button/link
Space:      Activate button
Escape:     Close modal/menu
```

### Focus Indicators
```jsx
// Always visible focus state
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
```

### ARIA Labels
```jsx
<button aria-label="Recognize sign">
  <CameraIcon />
</button>

<img src="sign.jpg" alt="Person signing hello" />

<div role="alert" className="text-red-600">
  Error message
</div>
```

---

## 10. DARK MODE (Optional)

### Dark Mode Colors

```
Dark BG:     #1F2937
Dark Card:   #111827
Dark Text:   #F3F4F6
Dark Border: #374151
```

### Implementation

```jsx
// Using Tailwind dark mode
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  ...
</div>
```

---

## 11. MOBILE DESIGN

### Responsive Design

```jsx
// Mobile-first approach
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Content</div>
</div>
```

### Mobile Considerations
```
✅ Touch-friendly buttons (44x44px min)
✅ Readable text (16px minimum)
✅ Vertical layout on mobile
✅ Full-width on small screens
✅ Large tap targets
✅ No hover states (use active states)
✅ Optimize images for mobile
```

---

## 12. SCREEN DESIGNS

### Home Screen (Camera View)

```
┌──────────────────────────────┐
│  Sign Language Bridge        │
│  EN / UR    ⚙️ User Menu    │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   CAMERA / VIDEO       │  │
│  │   with hand overlay    │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ A    Confidence: 97%   │  │
│  └────────────────────────┘  │
│                              │
│  Text Output: "Hello"        │
│                              │
│  ┌────────────────────────┐  │
│  │ ← Back  Space  Clear   │  │
│  │ 🔊 Speak  📋 Copy  💾  │  │
│  └────────────────────────┘  │
│                              │
│  اردو: السلام علیکم          │
│                              │
│  😊                          │
└──────────────────────────────┘
```

### History Screen

```
┌──────────────────────────────┐
│  Communication History       │
├──────────────────────────────┤
│                              │
│ Today                        │
│ ┌────────────────────────┐  │
│ │ "Hello, how are you?"  │  │
│ │ Aug 7, 2:30 PM        │  │
│ └────────────────────────┘  │
│                              │
│ ┌────────────────────────┐  │
│ │ "Thank you"            │  │
│ │ Aug 7, 2:25 PM        │  │
│ └────────────────────────┘  │
│                              │
│ Yesterday                    │
│ ┌────────────────────────┐  │
│ │ "I am learning signs"  │  │
│ │ Aug 6, 4:15 PM        │  │
│ └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

---

## 13. DESIGN TOKENS (CSS Variables)

```css
/* Colors */
--color-primary: #3B82F6;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Typography */
--font-size-sm: 12px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 20px;
--font-size-2xl: 28px;
--font-size-3xl: 36px;

--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

---

## 14. TAILWIND CONFIG

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      spacing: {
        safe: 'max(env(safe-area-inset-bottom), 1rem)',
      },
      fontSize: {
        '2xs': '10px',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
        slideUp: 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
};
```

---

## 15. DESIGN CHECKLIST

```
Before implementing UI:
[ ] Review color palette
[ ] Check typography hierarchy
[ ] Spacing consistent
[ ] Icons chosen
[ ] Animations defined
[ ] Responsive breakpoints planned
[ ] Accessibility requirements met
[ ] Dark mode (if needed) designed
[ ] Mobile design considered
[ ] Button states designed
[ ] Error states designed
[ ] Loading states designed
[ ] Focus indicators visible
```

---

**Document Owner:** Design Team  
**Last Updated:** August 7, 2026
