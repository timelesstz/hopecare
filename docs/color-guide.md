# HopeCare Color Guide

## Brand Colors

### Primary Colors

| Color Name    | Hex Code | RGB           | Usage                                    |
|--------------|----------|---------------|------------------------------------------|
| HopeCare Blue | `#2B8ACB` | rgb(43,138,203) | Primary brand color, main UI elements    |
| HopeCare Orange | `#F7941D` | rgb(247,148,29) | Secondary brand color, accents & CTAs    |

### Color Variations

#### Blue Palette
| Variation    | Hex Code | Usage                                    |
|--------------|----------|------------------------------------------|
| Blue Light   | `#4BA3E3` | Hover states, backgrounds                |
| Blue Default | `#2B8ACB` | Primary buttons, links                   |
| Blue Dark    | `#1E6CA3` | Active states, text                      |

#### Orange Palette
| Variation     | Hex Code | Usage                                    |
|---------------|----------|------------------------------------------|
| Orange Light  | `#FFA94D` | Hover states, backgrounds                |
| Orange Default| `#F7941D` | Secondary buttons, highlights            |
| Orange Dark   | `#D97B06` | Active states, text                      |

## Usage Guidelines

### Primary Elements
- **Navigation**: Use HopeCare Blue (`#2B8ACB`) for the main navigation bar
- **Buttons**: 
  - Primary actions: HopeCare Blue (`#2B8ACB`)
  - Secondary actions: HopeCare Orange (`#F7941D`)
  - Hover states: Use respective light variations

### Text Colors
- **Headers**: HopeCare Blue Dark (`#1E6CA3`)
- **Links**: HopeCare Blue (`#2B8ACB`)
- **Highlighted Text**: HopeCare Orange (`#F7941D`)

### Backgrounds
- **Primary Sections**: HopeCare Blue Light (`#4BA3E3`) at 10% opacity
- **Secondary Sections**: HopeCare Orange Light (`#FFA94D`) at 10% opacity
- **Gradients**: 
  - Blue gradient: `from-[#2B8ACB] to-[#1E6CA3]`
  - Orange gradient: `from-[#F7941D] to-[#D97B06]`

### Component-Specific Usage

#### Buttons
```jsx
// Primary Button
<button className="bg-hopecare-blue hover:bg-hopecare-blue-light">
  Primary Action
</button>

// Secondary Button
<button className="bg-hopecare-orange hover:bg-hopecare-orange-light">
  Secondary Action
</button>
```

#### Links
```jsx
<a className="text-hopecare-blue hover:text-hopecare-blue-dark">
  Link Text
</a>
```

#### Headers
```jsx
<h1 className="text-hopecare-blue-dark">
  Main Header
</h1>
```

#### Backgrounds
```jsx
<div className="bg-hopecare-blue-light bg-opacity-10">
  Content Section
</div>
```

## Accessibility

- Ensure sufficient contrast ratios:
  - Blue text (`#2B8ACB`) on white: 4.5:1
  - Orange text (`#F7941D`) on white: 3.8:1 (use darker variation for small text)
  - White text on Blue (`#2B8ACB`): 4.5:1

## Implementation in Tailwind

Add these colors to your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'hopecare': {
          blue: '#2B8ACB',
          orange: '#F7941D',
          'blue-dark': '#1E6CA3',
          'orange-dark': '#D97B06',
          'blue-light': '#4BA3E3',
          'orange-light': '#FFA94D'
        }
      }
    }
  }
}
```

## Best Practices

1. **Consistency**: Use the defined color palette consistently across the application
2. **Hierarchy**: Use Blue for primary elements and Orange for secondary/accent elements
3. **Accessibility**: Ensure text remains readable by maintaining proper contrast ratios
4. **Whitespace**: Use light variations for backgrounds to create visual hierarchy
5. **Emphasis**: Use Orange sparingly to highlight important elements or calls to action

## Color Psychology

- **Blue** represents:
  - Trust and reliability
  - Professionalism
  - Stability
  - Care and support

- **Orange** represents:
  - Energy and enthusiasm
  - Action and confidence
  - Warmth and friendliness
  - Accessibility and affordability

## Version Control

| Version | Date       | Changes                                    |
|---------|------------|-------------------------------------------|
| 1.0     | 2024-03-17 | Initial color guide documentation         |

## New Color Palette

### Primary Colors

#### Rose
- Primary: `rose-500` (#F43F5E)
- Light: `rose-50` (#FFF1F2)
- Dark: `rose-700` (#BE123C)

Used for:
- Call-to-action buttons
- Important links
- Accent elements
- Icons and highlights

#### Gray
- Text: `gray-900` (#111827)
- Subtext: `gray-600` (#4B5563)
- Light Background: `gray-50` (#F9FAFB)

Used for:
- Main text content
- Secondary text
- Backgrounds
- Borders

## Gradients

### Background Gradients
- Primary: `from-rose-50 to-white`
- Secondary: `from-gray-50 to-white`

Used for:
- Section backgrounds
- Hero sections
- Card hover effects

## Shadows

### Card Shadows
- Default: `shadow-lg`
- Hover: `shadow-xl`
- Light: `shadow`

## Dynamic Color System

### Primary Colors

| Color Name    | Variable          | Hex Code | RGB           | Usage                                    |
|--------------|-------------------|----------|---------------|------------------------------------------|
| Blue Light   | primary.light     | `#4BA3E3` | rgb(75,163,227) | Hover states, backgrounds                |
| Blue Default | primary.default   | `#2B8ACB` | rgb(43,138,203) | Primary buttons, links                   |
| Blue Dark    | primary.dark      | `#1E6CA3` | rgb(30,108,163) | Active states, text                      |

### Secondary Colors

| Color Name     | Variable          | Hex Code | Usage                                    |
|---------------|-------------------|----------|------------------------------------------|
| Orange Light  | secondary.light   | `#FFA94D` | Hover states, backgrounds                |
| Orange Default| secondary.default | `#F7941D` | Secondary buttons, highlights            |
| Orange Dark   | secondary.dark    | `#D97B06` | Active states, text                      |

### System Colors

#### Success
| Color Name     | Variable        | Hex Code | Usage                                    |
|---------------|-----------------|----------|------------------------------------------|
| Success Light | success.light   | `#68D391` | Success states, positive indicators      |
| Success Default| success.default| `#48BB78` | Success buttons, checkmarks              |
| Success Dark  | success.dark    | `#2F855A` | Success text, icons                      |

#### Error
| Color Name   | Variable      | Hex Code | Usage                                    |
|-------------|---------------|----------|------------------------------------------|
| Error Light | error.light   | `#FC8181` | Error states, negative indicators        |
| Error Default| error.default| `#F56565` | Error messages, alerts                   |
| Error Dark  | error.dark    | `#C53030` | Error text, critical messages            |

## Usage Guidelines

### Dynamic Color System
Colors can be accessed and modified through our theme system:
```typescript
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { colors } = useTheme();
  return <div style={{ color: colors.primary.default }}>...</div>;
};
```

### Primary Elements
- **Navigation**: Use `primary.default`
- **Buttons**: 
  - Primary actions: `primary.default`
  - Secondary actions: `secondary.default`
  - Hover states: Use respective `.light` variations
  - Active states: Use respective `.dark` variations

### Text Colors
- **Headers**: `primary.dark`
- **Body text**: Standard gray or `primary.dark`
- **Links**: `primary.default`
- **Error messages**: `error.dark`
- **Success messages**: `success.dark`

### Form Elements
- **Input borders**: Gray by default, `primary.default` on focus
- **Input icons**: `primary.default`
- **Validation**: 
  - Error states: `error.default`
  - Success states: `success.default`
- **Checkboxes/Radio**: `primary.default` when checked

### Accessibility Guidelines
1. **Contrast Ratios**
   - All text maintains WCAG 2.1 AA standards
   - Primary text: 4.5:1 minimum contrast ratio
   - Large text: 3:1 minimum contrast ratio

2. **Color Independence**
   - Never rely solely on color to convey information
   - Always include supporting text or icons
   - Provide alternative indicators for color-blind users

3. **Focus States**
   - All interactive elements have visible focus states
   - Focus rings use `primary.light` with sufficient contrast

4. **Error States**
   - Error messages combine `error.dark` color with icons
   - Form validation includes both color and text feedback

### Implementation Notes
1. **CSS Classes**
   - Use Tailwind CSS with custom colors
   - Access via theme system for dynamic updates
   - Maintain consistent naming conventions

2. **Responsive Design**
   - Colors maintain consistency across breakpoints
   - Contrast ratios verified at all screen sizes

3. **Dark Mode Support**
   - Color system ready for dark mode implementation
   - Variables will adjust automatically when enabled

4. **Performance**
   - Colors optimized for rendering performance
   - System supports runtime updates without flicker