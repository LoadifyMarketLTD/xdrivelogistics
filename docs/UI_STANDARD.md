# UI Standard - Light Premium Theme

Generated: 2026-02-17

## Color System

All colors are defined as CSS variables in `styles/portal.css`:

### Core Colors
```css
--bg: #F4F6F9              /* Main page background */
--card: #FFFFFF            /* Card/panel background */
--text: #1F2937            /* Primary text color */
--muted: #6B7280           /* Secondary/muted text */
--border: #E5E7EB          /* Border color */
```

### Action Colors
```css
--primary: #2563EB         /* Primary blue */
--primaryHover: #1D4ED8    /* Primary hover state */
--success: #10B981         /* Success green */
--danger: #EF4444          /* Error/danger red */
--warning: #F59E0B         /* Warning orange */
```

### Effects
```css
--shadow: 0 2px 8px rgba(0,0,0,0.05)  /* Standard shadow */
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

### Text Hierarchy
- **Page Title (H1)**: 20px, 700 weight, #1F2937, uppercase, 0.5px spacing
- **Section Title (H2)**: 16px, 600 weight, #1F2937
- **Section Header**: 14px, 700 weight, #374151, uppercase
- **Body Text**: 14px, normal weight, #1F2937
- **Helper Text**: 12px, normal weight, #6B7280
- **Form Labels**: 14px, 600 weight, #374151

### Input Text Visibility
✅ All inputs use: `color: #1F2937` (dark gray on white)
✅ Placeholder text: `color: #9CA3AF` (visible but subtle)
✅ No white-on-white or light-gray-on-light-gray combinations

## Layout Structure

Every portal page MUST follow this structure:

```tsx
<div className="portal-layout">
  <div className="portal-header">
    <h1 className="portal-title">Page Title</h1>
  </div>
  
  <main className="portal-main">
    <div className="portal-card">
      <h1 className="section-title">Main Section</h1>
      <p className="page-description">Description text</p>
      
      {/* Content */}
    </div>
  </main>
</div>
```

### Layout Classes
- `.portal-layout` - Full page wrapper with #F4F6F9 background
- `.portal-header` - 64px header bar, white background
- `.portal-title` - Page title styling
- `.portal-main` - Content area, max-width 1100px, centered, 40px padding
- `.portal-card` - White card, 8px radius, border, shadow, 40px padding

## Form Components

### Form Structure
```tsx
<div className="form-section">
  <h2 className="form-section-title">Section Name</h2>
  
  <div className="form-grid-2">
    <div className="form-field">
      <label className="form-label">Field Label</label>
      <input className="form-input" />
    </div>
  </div>
</div>
```

### Form Classes
- `.form-section` - Section wrapper, 32px margin bottom
- `.form-section-title` - 16px, 600 weight
- `.form-grid-2` - 2-column grid (responsive to 1 column on mobile)
- `.form-grid-3` - 3-column grid
- `.form-field` - Field wrapper with 6px gap
- `.form-label` - 14px, 600 weight, #374151
- `.form-input` - White bg, #1F2937 text, #D1D5DB border, focus: #2563EB ring

### Input States
- **Default**: White background, gray border
- **Focus**: Blue border (#2563EB) + blue ring shadow
- **Disabled**: Opacity 0.6, not-allowed cursor
- **Error**: Red border, red ring

## Buttons

### Primary Button
```tsx
<button className="btn-primary">Action</button>
```
- Background: #2563EB
- Hover: #1D4ED8
- Text: white, 14px, 600 weight
- Padding: 12px 28px
- Radius: 6px

### Secondary Button
```tsx
<button className="btn-secondary">Cancel</button>
```
- Background: white
- Border: 1px solid #D1D5DB
- Text: #1F2937
- Hover: #F9FAFB background

### Other Button Variants
- `.btn-success` - Green button for positive actions
- `.btn-quote` - Green "Quote Now" button for Loads page

## Tables

### Table Structure
```tsx
<div className="table-container">
  <div className="table-header" style={{gridTemplateColumns: '...'}}>
    <div>Column 1</div>
    <div>Column 2</div>
  </div>
  
  <div className="table-row" style={{gridTemplateColumns: '...'}}>
    <div>Data 1</div>
    <div>Data 2</div>
  </div>
</div>
```

### Table Classes
- `.table-container` - White card wrapper
- `.table-header` - #F9FAFB background, 12px uppercase text
- `.table-row` - Hover: #F9FAFB background, cursor pointer
- `.table-empty` - Centered empty state message

## Status Badges

```tsx
<span className="status-badge open">Open</span>
```

Variants:
- `.status-badge.open` - Blue background
- `.status-badge.completed` - Green background
- `.status-badge.pending` - Yellow background
- `.status-badge.cancelled` - Red background

## Alerts

```tsx
<div className="alert-error">Error message</div>
<div className="alert-success">Success message</div>
```

## Loading States

```tsx
<div className="loading-screen">
  <div className="loading-text">Loading...</div>
</div>
```

## Stats Cards

```tsx
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-label">Label</div>
    <div className="stat-value">123</div>
    <div className="stat-description">Description</div>
  </div>
</div>
```

### Stat Value Variants
- `.stat-value` - Default black (#1F2937)
- `.stat-value.blue` - Blue (#3B82F6)
- `.stat-value.green` - Green (#10B981)

## Spacing System

Consistent spacing grid:
- **Gap between sections**: 24px
- **Card padding**: 40px (desktop), 24px (mobile)
- **Form field gap**: 16px
- **Form field internal gap**: 6px
- **Button group gap**: 12px
- **Table cell padding**: 12px 16px

## Responsive Breakpoints

- **Mobile**: < 768px
  - Single column grids
  - Full width buttons
  - Reduced card padding (24px)
  - Collapsible sidebar

- **Tablet**: 768px - 1024px
  - 2-column grids where applicable
  - Fixed sidebar

- **Desktop**: > 1024px
  - Full grid layouts (3-4 columns)
  - Fixed sidebar
  - Maximum content width: 1100px

## Tabs/Filters

### Tab Navigation
```tsx
<div className="loads-tabs">
  <button className="loads-tab loads-tab-active">Tab 1</button>
  <button className="loads-tab">Tab 2</button>
</div>
```

### Filters
```tsx
<div className="loads-filter-group">
  <label className="loads-filter-label">Filter</label>
  <input className="loads-filter-input" />
</div>
```

## Modal/Overlay

```tsx
<div className="modal-overlay">
  <div className="modal-content">
    <div className="modal-header">
      <h2>Modal Title</h2>
      <button className="btn-secondary">Close</button>
    </div>
    <div className="modal-body">
      {/* Content */}
    </div>
    <div className="modal-actions">
      <button className="btn-secondary">Cancel</button>
      <button className="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

## Empty States

```tsx
<div className="diary-empty">
  <div className="diary-empty-icon">📅</div>
  <div className="diary-empty-text">
    <p>No items found</p>
    <button className="btn-primary">Add New</button>
  </div>
</div>
```

## Implementation Checklist

For each new page or feature:
- [ ] Use `.portal-layout` wrapper
- [ ] Use `.portal-header` for page title
- [ ] Use `.portal-main` for content area
- [ ] Use `.portal-card` for sections
- [ ] NO inline `style={{}}` props
- [ ] NO Tailwind utility classes
- [ ] Use semantic class names from portal.css
- [ ] Ensure text is readable (dark on light)
- [ ] Add focus states to interactive elements
- [ ] Test responsiveness at 360px, 768px, 1280px
- [ ] Verify empty states have helpful messages
- [ ] Check loading states resolve correctly

## Files Modified

All styling centralized in:
- `styles/portal.css` - All portal theme CSS (~1500 lines)
- `app/globals.css` - Global resets and base styles

## Pages Using This Standard

✅ All 9 portal pages + Company Settings (10 total)
- Company Settings (reference)
- Dashboard
- Loads
- Quotes
- Diary
- Directory
- Drivers & Vehicles
- Live Availability
- Return Journeys
- Freight Vision
