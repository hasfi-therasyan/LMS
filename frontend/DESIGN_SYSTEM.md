# Professional Design System

## 🎨 Color Palette

### Primary Colors
- **Primary 600**: `#0284c7` - Main brand color
- **Primary 700**: `#0369a1` - Hover states
- **Accent 600**: `#c026d3` - Secondary actions
- **Success 600**: `#16a34a` - Success states
- **Warning 500**: `#f59e0b` - Warning states

### Neutral Colors
- **Gray 50**: Background
- **Gray 100**: Subtle backgrounds
- **Gray 200**: Borders
- **Gray 500**: Secondary text
- **Gray 900**: Primary text

## 📐 Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Headings
- **H1**: `text-3xl font-bold tracking-tight`
- **H2**: `text-2xl font-bold tracking-tight` (section-header)
- **H3**: `text-lg font-bold tracking-tight`
- **Body**: `text-base text-gray-900`
- **Small**: `text-sm text-gray-500`

## 🎯 Components

### Cards
```css
.card {
  @apply bg-white rounded-xl shadow-elevation-1 p-6 
         transition-all duration-300 
         hover:shadow-elevation-2 border border-gray-100;
}
```

### Buttons
- **Primary**: Gradient background, shadow, hover effects
- **Secondary**: White background, border, subtle hover
- **Ghost**: Minimal styling, hover background

### Input Fields
- Border: `border-gray-300`
- Focus: `border-primary-500 ring-2 ring-primary-100`
- Hover: `border-gray-400`

### Badges
- Primary: Blue background
- Success: Green background
- Warning: Yellow background
- Gray: Neutral background

## 📏 Spacing

- **Section spacing**: `mb-6` or `mb-8`
- **Card padding**: `p-6`
- **Grid gaps**: `gap-5` or `gap-6`
- **Component spacing**: `space-y-4` or `space-y-6`

## 🎭 Shadows

- **Elevation 1**: Subtle shadow for cards
- **Elevation 2**: Medium shadow for hover states
- **Elevation 3**: Strong shadow for modals/overlays

## ✨ Animations

- **Transitions**: `transition-all duration-200` or `duration-300`
- **Hover**: `hover:-translate-y-0.5` for buttons
- **Smooth**: `ease-out` for natural feel

## 🎪 Visual Hierarchy

1. **Primary Actions**: Gradient buttons with icons
2. **Secondary Actions**: Outlined buttons
3. **Information**: Cards with icons and badges
4. **Status**: Color-coded badges and progress bars

## 📱 Responsive Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)

## 🎨 Design Principles

1. **Consistency**: Same components across all pages
2. **Clarity**: Clear visual hierarchy
3. **Accessibility**: Good contrast, readable fonts
4. **Professional**: Clean, modern, polished
5. **User-friendly**: Intuitive navigation and interactions
