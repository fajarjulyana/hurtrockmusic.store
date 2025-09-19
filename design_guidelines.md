# Hurtrock Music Store Design Guidelines

## Design Approach
**Vintage Rock Aesthetic**: Drawing inspiration from vintage music culture and rockstar aesthetics, combining classic rock venues with modern e-commerce patterns. The design creates an immersive experience reminiscent of legendary music stores where rock history was made, while maintaining modern usability and accessibility standards.

## Core Design Elements

### A. Color Palette
**Primary Colors (Dark Mode)**:
- Background: 25 15% 8% (deep charcoal with warm undertones)
- Surface: 25 12% 12% (elevated surfaces)
- Text Primary: 35 8% 92% (warm off-white)

**Brand Orange (from logo)**:
- Primary Orange: 25 85% 55% (vibrant vintage orange)
- Orange Accent: 30 75% 45% (deeper burnt orange)
- Orange Light: 35 60% 70% (subtle orange highlights)

**Supporting Colors**:
- Gold Accent: 45 70% 60% (vintage brass/gold for premium items)
- Muted Orange: 25 45% 35% (borders and subtle elements)

### B. Typography
- **Primary**: Google Fonts "Bebas Neue" (headers, rockstar vibe)
- **Secondary**: "Inter" (body text, readability)
- **Accent**: "Rock Salt" (decorative elements, vintage feel)

### C. Layout System
Tailwind spacing primitives: **2, 4, 6, 8, 12, 16**
- Tight spacing: p-2, m-4
- Standard spacing: p-6, gap-8
- Generous spacing: p-12, mb-16

### D. Component Library

**Navigation**: Dark header with vintage-styled logo, orange accent hover states
**Product Cards**: Dark background with orange border on hover, vintage-inspired typography
**Buttons**: Primary orange with subtle texture effects, outline variants with blurred backgrounds over images
**Forms**: Dark inputs with orange focus rings, vintage-styled labels
**Hero Section**: Full-width with gradient overlay featuring brand orange tones

### E. Visual Treatment

**Gradients**: 
- Hero backgrounds: Deep charcoal to orange (25 15% 8% to 25 85% 55%)
- Button treatments: Subtle orange gradients (25 85% 55% to 30 75% 45%)
- Card overlays: Transparent black to orange tints

**Textures**: Subtle vintage paper texture overlays, distressed edge effects on key elements

**Background Treatments**: Dark base with warm orange accent lighting effects, vintage concert poster inspired sections

## Images Section

**Hero Image**: Large full-width hero featuring vintage amplifiers, guitars, or concert stage with orange lighting overlay
**Product Images**: High-quality photos of instruments against dark backgrounds with warm lighting
**Category Banners**: Vintage-styled graphics representing different music categories (guitars, drums, vinyl)
**Background Elements**: Subtle music-themed patterns (sheet music, sound waves) in very low opacity

## Key Design Principles

1. **Vintage Rockstar Aesthetic**: Embrace worn textures, bold typography, and concert-inspired layouts
2. **Orange Brand Consistency**: Use the logo's orange throughout as the primary accent and CTA color
3. **Dark Mode First**: Deep, warm dark backgrounds create an intimate music venue atmosphere
4. **Hierarchy Through Contrast**: Use orange strategically against dark backgrounds for important elements
5. **Mobile-First Responsive**: Ensure vintage aesthetics translate beautifully across all devices

## Implementation Details

### **Responsive Breakpoints:**
- **Mobile**: ≤768px (single column, drawer navigation)
- **Tablet**: 768px-1024px (two-column grid, condensed navigation)
- **Desktop**: ≥1024px (multi-column layout, full navigation)

### **Component Specifications:**

**Header Component**:
- Dark background with vintage orange logo accent
- Sticky navigation with smooth scroll behavior
- Mobile hamburger menu with slide-out drawer
- Search bar with orange focus states
- Cart icon with item count badge

**Product Cards**:
- Dark card background with subtle border
- Orange accent border on hover with smooth transition
- High-quality product images with aspect ratio preservation
- Typography hierarchy: Bebas Neue for titles, Inter for descriptions
- Orange CTA buttons with hover elevation effects

**Shopping Cart**:
- Slide-out panel design for non-disruptive shopping
- Session-based persistence across page refreshes
- Quantity controls with orange accent buttons
- Real-time total calculation with currency formatting

**Admin Panel**:
- Dark dashboard design with orange accent elements
- Form components with proper validation states
- Data tables with sorting and filtering capabilities
- Modal dialogs for CRUD operations

### **Accessibility Standards:**
- WCAG 2.1 AA compliance for color contrast
- Keyboard navigation support for all interactive elements
- Screen reader optimized with proper ARIA labels
- Focus indicators with orange accent colors
- Semantic HTML structure throughout

### **Performance Optimizations:**
- Lazy loading for product images and components
- Optimized font loading with display: swap
- CSS-in-JS optimization with Tailwind purging
- Image optimization with proper srcset attributes

### **International Design Considerations:**
- RTL layout support preparation (planned)
- Currency symbol positioning for IDR/USD
- Text expansion accommodation for translations
- Cultural color sensitivity (orange tested across cultures)

The design system creates an authentic vintage rock atmosphere while ensuring modern e-commerce functionality, accessibility, and performance across all devices and user contexts.