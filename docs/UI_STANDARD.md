# UI STANDARDS - XDrive Logistics Portal

**Version:** 1.0  
**Last Updated:** 2026-02-17  
**Design System:** Light Premium / Courier Exchange Style

---

## 1. TYPOGRAPHY STANDARDS

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Rationale:** System fonts for optimal performance and native OS feel

### Text Sizes & Hierarchy

| Element | Size | Weight | Usage | CSS Variable |
|---------|------|--------|-------|--------------|
| Page Title (h1) | 20-24px | 700 | Main page headings | `--text-h1: 20px` |
| Section Title (h2) | 16-18px | 600-700 | Section headers | `--text-h2: 16px` |
| Subsection (h3) | 14px | 600 | Card titles, labels | `--text-h3: 14px` |
| Body Text | 13-14px | 400-500 | Default content | `--text-body: 13px` |
| Helper Text | 11-12px | 400 | Hints, captions | `--text-small: 11px` |
| Input Labels | 12-13px | 500-600 | Form labels | `--text-label: 12px` |
| Table Headers | 11px | 700 | Table column headers | `--text-table-header: 11px` |

### Letter Spacing
- **Headers:** 0.5px (uppercase titles)
- **Body:** Normal (0px)
- **Small caps:** 0.3px

### Text Visibility Requirements
✅ **All input fields must have visible text while typing**
- Input text: minimum 13px, color #1f2937
- Placeholder text: #9ca3af
- Focus state: border change + no color change on text

---

## 2. COLOR SYSTEM (Light Premium)

### Primary Palette

```css
:root {
  /* Backgrounds */
  --bg-main: #f4f5f7;          /* Page background */
  --bg-secondary: #fafafa;     /* Alternate sections */
  --card-bg: #ffffff;          /* Card/panel background */
  
  /* Text Colors */
  --text-primary: #1f2937;     /* Main text */
  --text-secondary: #6b7280;   /* Secondary text */
  --text-muted: #9ca3af;       /* Muted/disabled text */
  --text-light: #d1d5db;       /* Very light text */
  
  /* Borders */
  --border: #e5e7eb;           /* Default borders */
  --border-dark: #d1d5db;      /* Hover/active borders */
  --border-focus: #d4af37;     /* Focus state borders */
  
  /* Brand Colors */
  --primary: #d4af37;          /* Gold accent */
  --primary-hover: #c29d2f;    /* Gold hover */
  --primary-light: #f4e8c1;    /* Gold light background */
  
  /* Dark Actions */
  --dark: #1f2937;             /* Dark buttons/sidebar */
  --dark-hover: #111827;       /* Dark hover */
  
  /* Status Colors */
  --success: #10b981;          /* Green */
  --success-bg: #d1fae5;       /* Green light */
  --success-text: #065f46;     /* Green dark */
  
  --warning: #f59e0b;          /* Orange */
  --warning-bg: #fef3c7;       /* Orange light */
  --warning-text: #92400e;     /* Orange dark */
  
  --error: #ef4444;            /* Red */
  --error-bg: #fee2e2;         /* Red light */
  --error-text: #991b1b;       /* Red dark */
  
  --info: #3b82f6;             /* Blue */
  --info-bg: #dbeafe;          /* Blue light */
  --info-text: #1e3a8a;        /* Blue dark */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Color Usage Rules

❌ **Never Use:**
- White text on white background
- Light gray (#f3f4f6) text on white background
- Hard-coded hex colors in components (use CSS variables)

✅ **Always Use:**
- CSS variables for all colors
- Minimum contrast ratio 4.5:1 for text
- Consistent status colors (green=success, red=error, orange=warning, blue=info)

---

## 3. LAYOUT & SPACING STANDARDS

### Container Classes

```css
.portal-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-main);
}

.portal-content {
  flex: 1;
  padding: 20-24px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.portal-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: 20px;
  border-radius: 8px; /* Subtle, not heavy */
}

.portal-header {
  padding: 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
```

### Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Tiny gaps |
| sm | 8px | Small gaps |
| md | 12px | Medium gaps |
| base | 16px | Default spacing |
| lg | 20px | Large spacing |
| xl | 24px | Section spacing |
| 2xl | 32px | Page sections |

### Consistent Spacing

**Card Padding:** 20px (default)  
**Section Margin:** 24px between sections  
**Form Grid Gap:** 16px between fields  
**Table Padding:** 10-12px cell padding  
**Button Padding:** 8px 16px (small), 10px 20px (medium)

### Maximum Width

**Portal Content:** 1100px (centered)  
**Forms:** 600-800px max  
**Modals:** 500px (small), 700px (medium), 900px (large)

---

## 4. COMPONENT STANDARDS

### Buttons

```css
/* Primary Button */
.portal-btn-primary {
  background: var(--primary);
  color: #ffffff;
  padding: 8px 16px;
  border: none;
  font-size: 12-13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.portal-btn-primary:hover {
  background: var(--primary-hover);
}

/* Dark Button */
.portal-btn-dark {
  background: var(--dark);
  color: #ffffff;
}

.portal-btn-dark:hover {
  background: var(--dark-hover);
}

/* Outline Button */
.portal-btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}
```

### Tabs

```css
.portal-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
}

.portal-tab {
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.portal-tab:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.portal-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--bg-secondary);
}
```

**Tab Requirements:**
✅ Tabs must maintain active state  
✅ Tabs must not reset on data updates  
✅ Tabs must be keyboard accessible (arrow keys)  
✅ Active tab must be visually distinct

### Filters

```css
.portal-filters {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  margin-bottom: 16px;
}

.portal-filter-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
}

.portal-filter-clear {
  color: var(--text-secondary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
}
```

**Filter Requirements:**
✅ Show current selected values  
✅ "Clear filters" button visible when filters applied  
✅ Filters don't break when no results  
✅ Filter state persists during pagination

### Dropdowns

**Requirements:**
✅ Open/close on click  
✅ Close on outside click  
✅ Close on ESC key  
✅ No overflow outside viewport  
✅ Max-height with scroll for long lists  
✅ Keyboard navigation (arrow keys + enter)

---

## 5. TABLES

```css
.portal-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.portal-table-header {
  background: #f9fafb;
  border-bottom: 1px solid var(--border);
}

.portal-table-header th {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  text-align: left;
}

.portal-table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.portal-table-row:hover {
  background: #f9fafb;
}

.portal-table-cell {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-primary);
}
```

**Responsive Table Strategy:**
- Desktop (>1024px): Full table
- Tablet (768-1024px): Horizontal scroll with shadow
- Mobile (<768px): Stacked cards or horizontal scroll

---

## 6. FORMS

```css
.portal-form-group {
  margin-bottom: 16px;
}

.portal-form-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.portal-form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary); /* VISIBLE TEXT */
  background: #ffffff;
  transition: border-color 0.2s;
}

.portal-form-input::placeholder {
  color: var(--text-muted);
}

.portal-form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.portal-form-helper {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.portal-form-error {
  font-size: 11px;
  color: var(--error);
  margin-top: 4px;
}
```

---

## 7. STATUS INDICATORS

```css
.portal-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.portal-status-success {
  background: var(--success-bg);
  color: var(--success-text);
}

.portal-status-warning {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.portal-status-error {
  background: var(--error-bg);
  color: var(--error-text);
}

.portal-status-info {
  background: var(--info-bg);
  color: var(--info-text);
}
```

---

## 8. MODALS

**Standard Modal Structure:**
```html
<div class="portal-modal-overlay">
  <div class="portal-modal">
    <div class="portal-modal-header">
      <h3>Modal Title</h3>
      <button class="portal-modal-close">×</button>
    </div>
    <div class="portal-modal-body">
      <!-- Content -->
    </div>
    <div class="portal-modal-footer">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  </div>
</div>
```

**Modal Requirements:**
✅ ESC key closes modal  
✅ Backdrop click closes modal  
✅ Focus trap within modal  
✅ Scroll lock on body  
✅ Smooth fade-in animation  
✅ Centered on viewport

---

## 9. EMPTY STATES

**Standard Empty State Structure:**
```html
<div class="portal-empty-state">
  <div class="portal-empty-icon">📦</div>
  <h3 class="portal-empty-title">No items yet</h3>
  <p class="portal-empty-text">Get started by creating your first item</p>
  <button class="portal-btn-primary">Create Item</button>
</div>
```

```css
.portal-empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.portal-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.portal-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.portal-empty-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
}
```

---

## 10. ERROR STATES

**User-Friendly Error Messages:**

❌ **Bad:** `Error: 23503 - Foreign key violation in table jobs`  
✅ **Good:** `Unable to delete this item because it has associated records.`

❌ **Bad:** `AuthError: JWT expired`  
✅ **Good:** `Your session has expired. Please log in again.`

**Error Display:**
```css
.portal-error-banner {
  padding: 12px 16px;
  background: var(--error-bg);
  border-left: 3px solid var(--error);
  color: var(--error-text);
  font-size: 13px;
  margin-bottom: 16px;
}
```

---

## 11. TOAST NOTIFICATIONS

**Requirements:**
✅ Auto-dismiss after 4-5 seconds  
✅ Manual dismiss with X button  
✅ Stack multiple toasts  
✅ Different colors for success/error/info/warning  
✅ Smooth slide-in from top or bottom

---

## 12. RESPONSIVE BREAKPOINTS

```css
/* Mobile */
@media (max-width: 767px) {
  .portal-content { padding: 12px; }
  .portal-card { padding: 16px; }
  h1 { font-size: 18px; }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .portal-content { padding: 16px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .portal-content { padding: 24px; }
  max-width: 1100px;
}

/* Large Desktop */
@media (min-width: 1440px) {
  max-width: 1200px;
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [x] Define CSS variables in portal.css
- [x] Create typography scale
- [x] Set color system
- [x] Define spacing scale

### Phase 2: Components
- [ ] Standardize all buttons
- [ ] Standardize all inputs
- [ ] Standardize all cards
- [ ] Standardize tabs/filters

### Phase 3: Pages
- [ ] Apply standards to all portal pages
- [ ] Remove inline styles where possible
- [ ] Replace hard-coded colors with variables
- [ ] Test input visibility on all pages

### Phase 4: Responsive
- [ ] Test at 360px, 768px, 1280px
- [ ] Fix table responsiveness
- [ ] Fix sidebar mobile behavior
- [ ] Capture screenshots

---

**Document Status:** ✅ COMPLETE  
**Next Steps:** Apply standards to all portal pages
