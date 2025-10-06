# 🎨 FOMO - Pure Black & White UI Showcase

## 🖤 Design Philosophy

**BRUTALIST • MINIMALIST • HIGH CONTRAST**

A pure black & white aesthetic inspired by:
- Terminal interfaces
- Brutalist architecture
- Swiss design
- Early computing displays
- Maximum readability

---

## 🎨 Color Palette

```
■ BLACK   #000000  - Background, text on white
□ WHITE   #FFFFFF  - Text, borders, accents
░ GRAY-900 #171717  - Subtle backgrounds
▒ GRAY-800 #262626  - Borders
▓ GRAY-500 #737373  - Muted text
```

**No colors. Pure contrast.**

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ ■ FOMO                            [—] [□] [×]          │  10px
├─────┬───────────────────────────────────────────────────┤
│     │                                                   │
│  ■  │                 MAIN CONTENT                     │
│     │                                                   │
│  ●  │         Grid Pattern Background                  │
│     │                                                   │
│  #  │            Pure Black Base                       │
│     │                                                   │
│  ⚙  │         White Text & Borders                     │
│     │                                                   │
│ 80px│                                              400px│
└─────┴───────────────────────────────────────────────────┘
  │                    STATUS BAR                          │  32px
  └────────────────────────────────────────────────────────┘
```

---

## 🎯 Key UI Components

### 1. Titlebar
```
┌────────────────────────────────────────┐
│ ■ FOMO         [—] [□] [×]            │
└────────────────────────────────────────┘
```
- Height: 40px
- Pure black background
- White text, uppercase, bold
- Small white square logo
- Hover states: white background

### 2. Sidebar
```
┌────┐
│ ■  │ ← Active (white bg, black icon)
├────┤
│ ●  │ ← Inactive (black bg, white icon)
├────┤
│ #  │
├────┤
│ ⚙  │
└────┘
```
- Width: 80px
- Square buttons (56x56px)
- 2px borders
- Badge counts on top-right
- Recording pulse indicator

### 3. Recording Button
```
   Idle State:
   ┌──────────┐
   │    ▶     │  ← Black bg, white border
   └──────────┘

   Recording State:
   ╔══════════╗
   ║    ■     ║  ← White bg, black icon, glowing
   ╚══════════╝
```
- Size: 96x96px
- 4px border
- Glow animation when recording
- Pulsing outer border

### 4. Status Bar
```
┌────────────────────────────────────────┐
│ ● 00:42 | 12 SEG | 3 ITEMS   CONNECTED│
└────────────────────────────────────────┘
```
- Height: 32px
- Monospace font
- Uppercase labels
- Pipe separators
- Status indicators

### 5. Transcript Cards
```
┌──────────────────────────────────────┐
│ SPEAKER 1        00:42                │
│                                       │
│ This is the transcript text in       │
│ white on black background...         │
│                                       │
└──────────────────────────────────────┘
```
- 2px white borders (10% opacity)
- No rounded corners
- Hover: shifts with shadow
- Uppercase speaker labels

### 6. Action Item Cards
```
┌──│────────────────────────────────────┐
│  │ ○ Fix the authentication bug      │ ← Priority border
│  │                                    │
│  │ [ SHOW CONTEXT ]                  │
│  │                                    │
│  │ @john-doe         [CREATE ISSUE]  │
└──┴────────────────────────────────────┘
```
- Left border: 4px (priority indicator)
- White on black
- Brutalist button style
- Uppercase labels

---

## 🎭 Interaction States

### Buttons

**Idle:**
```
┌─────────────┐
│ CLICK HERE  │  Black bg, white border
└─────────────┘
```

**Hover:**
```
╔═════════════╗
║ CLICK HERE  ║  White bg, black text
╚═════════════╝
```

**Active/Pressed:**
```
┌─────────────┐
│ CLICK HERE  │  Shifted position
└─────────────┘
```

---

## 🔤 Typography

### Font Stack
```
Primary: Inter (sans-serif)
Monospace: JetBrains Mono
```

### Font Weights
```
Regular  400  - Body text
Bold     700  - Emphasis
Black    900  - Headings
```

### Font Sizes
```
xs    12px  - Labels, status
sm    14px  - Body text
base  16px  - Default
lg    18px  - Subheadings
xl    20px  - Section titles
2xl   24px  - Page titles
3xl   30px  - Hero text
4xl   36px  - Large display
5xl   48px  - Extra large
```

### Text Styles
```
UPPERCASE     - All headings and labels
tracking-wider - Increased letter spacing
font-mono     - Status bar, code
font-black    - Maximum boldness
```

---

## ✨ Animations

### 1. Recording Pulse
```
Scale: 1.0 → 1.1 → 1.0
Opacity: 0.3 → 0 → 0.3
Duration: 2s infinite
```

### 2. Glow Effect
```
Shadow: 20px → 40px → 20px
Duration: 2s infinite
Color: White with opacity
```

### 3. Hover Transform
```
Shadow: none → 4px brutal shadow
Position: 0,0 → 1px,1px
Duration: 150ms
```

### 4. Slide Up
```
Y: 10px → 0px
Opacity: 0 → 1
Duration: 200ms
```

---

## 🎨 Special Effects

### Grid Pattern Background
```
White lines (5% opacity)
20x20px grid
Covers full viewport
Pointer-events: none
```

### Scan Lines (Optional)
```
Horizontal lines
4px spacing
3% white opacity
Retro CRT effect
```

### Brutalist Shadows
```
shadow-brutal: 4px 4px 0px 0px black
shadow-brutal-lg: 8px 8px 0px 0px black
```

---

## 📱 Responsive Breakpoints

```
Sidebar:     80px  (fixed)
Action Panel: 400px (fixed)
Main Content: flex (remaining space)

Minimum window: 1024x768
Optimal:       1400x900
```

---

## 🎯 Visual Hierarchy

### Level 1: Critical Actions
- Recording button (96x96px)
- White background when active
- Glowing effect
- Center positioned

### Level 2: Primary Content
- Transcript feed
- Action items
- White text on black
- 2px borders

### Level 3: Navigation
- Sidebar buttons
- Top titlebar
- Bottom status bar

### Level 4: Metadata
- Timestamps
- Status indicators
- Small gray text
- Monospace font

---

## 🎨 Component Examples

### Empty State
```
┌────────────────────────────────────┐
│                                    │
│          [ READY ]                 │
│                                    │
│     PRESS RECORD TO BEGIN          │
│                                    │
└────────────────────────────────────┘
```

### Loading State
```
┌────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░        │
│                                    │
│       [ PROCESSING ]               │
│                                    │
└────────────────────────────────────┘
```

### Error State
```
┌────────────────────────────────────┐
│  ╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳  │
│                                    │
│     [ CONNECTION FAILED ]          │
│                                    │
│       RETRY • CANCEL               │
│                                    │
└────────────────────────────────────┘
```

---

## 🔧 CSS Variables

```css
/* Colors */
--black: #000000;
--white: #FFFFFF;
--gray-900: #171717;
--gray-800: #262626;
--gray-500: #737373;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Borders */
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 4px;

/* Transitions */
--transition-fast: 150ms;
--transition-normal: 300ms;
--transition-slow: 500ms;
```

---

## 🎯 Accessibility Features

✅ **High Contrast**: Black & white ensures WCAG AAA
✅ **Focus Indicators**: White 2px ring
✅ **Keyboard Navigation**: All buttons accessible
✅ **Screen Reader**: ARIA labels on all controls
✅ **Font Sizes**: Scalable, minimum 12px

---

## 🖼️ UI States

### 1. Idle (Not Recording)
```
- Large play button (black with white border)
- Text: "[ READY ]"
- No transcript visible
- Sidebar: all inactive
```

### 2. Recording
```
- Square stop button (white with glow)
- Timer: 00:42 (large, monospace)
- Transcript: scrolling feed
- Action items: appearing on right
- Status bar: active indicators
```

### 3. Paused
```
- Stop button + Resume button visible
- Timer: frozen
- Text: "[ PAUSED ]"
- Transcript: static
```

---

## 🎨 Inspiration & References

**Design Movements:**
- Swiss International Style
- Brutalist Web Design
- Terminal UI aesthetics
- Bauhaus simplicity

**Similar Apps:**
- Waveform (audio editor)
- Linear (issue tracking)
- Arc Browser (minimalist)
- Notion (clean interface)

**Key Principles:**
1. Function over form
2. Clarity over cleverness
3. Speed over flash
4. Content over chrome

---

## 📐 Measurements

```
Titlebar:          40px height
Sidebar:           80px width
Status Bar:        32px height
Recording Button:  96x96px
Sidebar Buttons:   56x56px
Action Panel:      400px width
Border Width:      2px standard
Border Radius:     0px (square everything)
Grid Pattern:      20x20px
```

---

## 🎯 The Experience

**Opening the app:**
1. Black window fades in
2. Grid pattern visible in background
3. White square logo pulses once
4. Text: "[ READY ]" appears
5. Cursor changes to pointer on button

**Starting recording:**
1. Button inverts (white background)
2. Glow effect activates
3. Timer starts counting
4. Transcript appears below
5. Status bar updates

**Real-time feeling:**
1. New transcript segments slide up
2. Action items pop in from right
3. Counters increment
4. Everything is instant, no lag

---

## 💡 Pro Tips for Users

1. **High contrast = easy on eyes** for long sessions
2. **No distractions** - pure focus on content
3. **Fast** - minimal rendering, maximum performance
4. **Professional** - looks like serious software
5. **Timeless** - won't look dated next year

---

## 🖤 Philosophy

> "The best interface is no interface."
>
> But when you need one, make it:
> - **Black** (focus)
> - **White** (clarity)
> - **Bold** (confidence)
> - **Fast** (respect)

---

**Every pixel serves a purpose.**

**No gradients. No shadows (except functional).**

**No rounded corners. No decoration.**

**Just pure, unapologetic functionality.**

---

## 🎯 Command to See It

```bash
npm run electron:dev
```

**Experience the brutalist beauty yourself.** 🖤🤍
