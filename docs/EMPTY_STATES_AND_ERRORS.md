# EMPTY STATES AND ERROR HANDLING - STANDARDIZATION

**Generated:** 2026-02-17  
**Purpose:** Document standardized approaches for empty states and error handling across the portal

---

## 1. EMPTY STATE STANDARDS

### Current Implementation Status

| Page | Has Empty State | Implementation | Quality | Action Needed |
|------|----------------|----------------|---------|---------------|
| Dashboard | ✅ Yes | Text: "No loads posted yet" | Basic | ✅ Upgrade to component |
| Loads | ❌ No | Missing when filtered | None | 🔴 **ADD** |
| Quotes | ✅ Yes | EmptyState component | Good | ✅ Keep |
| Directory | ✅ Yes | Text + emoji "No companies found" | Good | ✅ Keep |
| Drivers-Vehicles | ✅ Yes | Text "No drivers/vehicles registered" | Basic | ✅ Upgrade to component |
| My Fleet | ❌ No | Shows stats even with 0 vehicles | None | 🔴 **ADD** |
| Live Availability | ✅ Yes | Text + emoji "No available vehicles" | Good | ✅ Keep |
| Freight Vision | ❌ No | Shows charts with no data | None | 🔴 **ADD** |
| Diary | ✅ Yes | EmptyState component | Excellent | ✅ **BEST PRACTICE** |
| Return Journeys | ✅ Yes | Text + emoji "No completed journeys" | Good | ✅ Keep |

---

## 2. STANDARDIZED EMPTY STATE COMPONENT

### Recommended Structure

```tsx
// components/portal/EmptyState.tsx

interface EmptyStateProps {
  icon?: string | React.ReactNode  // Emoji or icon component
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="portal-empty-state">
      {icon && <div className="portal-empty-icon">{icon}</div>}
      <h3 className="portal-empty-title">{title}</h3>
      {description && <p className="portal-empty-text">{description}</p>}
      {action && (
        <button 
          onClick={action.onClick}
          className="portal-btn portal-btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

### CSS Classes (Already in portal.css)

```css
.portal-empty-state {
  text-align: center;
  padding: 60px 20px;
}

.portal-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.portal-empty-title {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.portal-empty-text {
  font-size: var(--text-body);
  color: var(--text-muted);
  margin-bottom: 20px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
```

---

## 3. EMPTY STATE EXAMPLES BY PAGE

### Loads Page (NEEDS TO BE ADDED)

```tsx
// When filteredLoads.length === 0
<EmptyState
  icon="📦"
  title="No loads found"
  description="Try adjusting your filters or check back later for new opportunities."
  action={{
    label: "Clear Filters",
    onClick: clearFilters
  }}
/>
```

### My Fleet Page (NEEDS TO BE ADDED)

```tsx
// When vehicles.length === 0
<EmptyState
  icon="🚛"
  title="No vehicles in your fleet"
  description="Add your first vehicle to start managing your fleet and accepting loads."
  action={{
    label: "Add Vehicle",
    onClick: () => setShowForm(true)
  }}
/>
```

### Freight Vision Page (NEEDS TO BE ADDED)

```tsx
// When no data available for analytics
<EmptyState
  icon="📊"
  title="No data available"
  description="Complete some loads to see your analytics and performance metrics."
/>
```

### Dashboard (UPGRADE EXISTING)

**Current:**
```tsx
<div>No loads posted yet</div>
```

**Improved:**
```tsx
<EmptyState
  icon="🏁"
  title="Welcome to XDrive Logistics"
  description="Get started by browsing available loads or posting your first job."
  action={{
    label: "Browse Loads",
    onClick: () => router.push('/loads')
  }}
/>
```

### Drivers-Vehicles (UPGRADE EXISTING)

**Current:**
```tsx
<div style={{...}}>No drivers registered</div>
```

**Improved:**
```tsx
<EmptyState
  icon="👤"
  title="No drivers yet"
  description="Add drivers to assign them to loads and manage your team."
  action={{
    label: "Add Driver",
    onClick: openDriverForm
  }}
/>
```

---

## 4. ERROR HANDLING STANDARDS

### Current Implementation Status

| Page | Has Error UI | Error Display | Quality | Action Needed |
|------|-------------|---------------|---------|---------------|
| Loads | ✅ Yes | Banner with message | Good | ✅ Keep |
| Quotes | ✅ Yes | Banner with message | Good | ✅ Keep |
| Dashboard | ❌ No | console.error only | None | 🔴 **ADD** |
| Directory | ❌ No | console.error only | None | 🔴 **ADD** |
| Drivers-Vehicles | ❌ No | console.error only | None | 🔴 **ADD** |
| My Fleet | ❌ No | console.error only | None | 🔴 **ADD** |
| Live Availability | ❌ No | console.error only | None | 🔴 **ADD** |
| Freight Vision | ❌ No | console.error only | None | 🔴 **ADD** |
| Diary | ❌ No | console.error only | None | 🔴 **ADD** |
| Return Journeys | ❌ No | console.error only | None | 🔴 **ADD** |

**Critical Issue:** 8 out of 10 pages silently fail errors (only log to console).

---

## 5. STANDARDIZED ERROR COMPONENT

### Error Banner Component

```tsx
// components/portal/ErrorBanner.tsx

interface ErrorBannerProps {
  error: Error | string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const message = typeof error === 'string' ? error : error.message
  const userMessage = getUserFriendlyError(message)
  
  return (
    <div className="portal-error-banner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Error:</strong> {userMessage}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onRetry && (
            <button onClick={onRetry} className="portal-btn-outline">
              Retry
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper to convert technical errors to user-friendly messages
function getUserFriendlyError(message: string): string {
  if (message.includes('JWT expired')) {
    return 'Your session has expired. Please log in again.'
  }
  if (message.includes('23503') || message.includes('foreign key')) {
    return 'This item cannot be deleted because it has related records.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (message.includes('permission') || message.includes('401') || message.includes('403')) {
    return 'You do not have permission to perform this action.'
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.'
  }
  // Default: show message but sanitize technical jargon
  return message.replace(/\b[0-9]{5}\b/g, '').trim() || 'An error occurred. Please try again.'
}
```

### CSS Classes (Already in portal.css)

```css
.portal-error-banner {
  padding: 12px 16px;
  background: var(--error-bg);
  border-left: 3px solid var(--error);
  color: var(--error-text);
  font-size: var(--text-body);
  margin-bottom: 16px;
  border-radius: 4px;
}

.portal-success-banner {
  padding: 12px 16px;
  background: var(--success-bg);
  border-left: 3px solid var(--success);
  color: var(--success-text);
  font-size: var(--text-body);
  margin-bottom: 16px;
  border-radius: 4px;
}

.portal-info-banner {
  padding: 12px 16px;
  background: var(--info-bg);
  border-left: 3px solid var(--info);
  color: var(--info-text);
  font-size: var(--text-body);
  margin-bottom: 16px;
  border-radius: 4px;
}
```

---

## 6. ERROR MESSAGE TRANSLATION GUIDE

### ❌ Bad Examples (Technical Errors Exposed to Users)

| Technical Error | Issue |
|----------------|-------|
| `Error: 23503 - Foreign key violation in table jobs` | Database jargon |
| `AuthError: JWT expired at 2026-02-17T10:23:45Z` | Technical auth details |
| `TypeError: Cannot read property 'map' of undefined` | Code-level error |
| `Failed to fetch` | Too vague |
| `Error: Invalid input syntax for type uuid` | Database-specific |

### ✅ Good Examples (User-Friendly Messages)

| User-Friendly Message | When to Use |
|----------------------|-------------|
| `Your session has expired. Please log in again.` | JWT/auth expiration |
| `Unable to delete this item because it has related records.` | Foreign key constraint |
| `Unable to load data. Please try again.` | Generic fetch error |
| `Network error. Please check your connection and try again.` | Network issues |
| `You do not have permission to perform this action.` | 401/403 errors |
| `The requested resource was not found.` | 404 errors |
| `Please fill in all required fields.` | Validation errors |

---

## 7. IMPLEMENTATION PLAN

### Phase 1: Add Error Banners (High Priority)
- [ ] Add `ErrorBanner` component to components/portal/
- [ ] Add error state to Dashboard page
- [ ] Add error state to Directory page
- [ ] Add error state to Drivers-Vehicles page
- [ ] Add error state to My Fleet page
- [ ] Add error state to Live Availability page
- [ ] Add error state to Freight Vision page
- [ ] Add error state to Diary page
- [ ] Add error state to Return Journeys page

### Phase 2: Add Missing Empty States
- [ ] Add empty state to Loads page (when filtered)
- [ ] Add empty state to My Fleet page (when no vehicles)
- [ ] Add empty state to Freight Vision page (when no data)

### Phase 3: Upgrade Existing Empty States
- [ ] Upgrade Dashboard empty state to use EmptyState component
- [ ] Upgrade Drivers-Vehicles empty states to use EmptyState component

### Phase 4: Standardize Existing Implementations
- [ ] Ensure all EmptyState components use consistent styling
- [ ] Ensure all error banners use consistent styling
- [ ] Add retry functionality to all error banners where appropriate

---

## 8. CODE EXAMPLES FOR EACH PAGE

### Dashboard Error Handling (TO ADD)

```tsx
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setError(null)
      // ... fetch logic
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    }
  }
  fetchData()
}, [companyId])

// In JSX
{error && <ErrorBanner error={error} onRetry={() => window.location.reload()} />}
```

### Directory Error Handling (TO ADD)

```tsx
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchCompanies = async () => {
    try {
      setError(null)
      // ... fetch logic
    } catch (err: any) {
      console.error('Error fetching companies:', err)
      setError('Unable to load company directory. Please try again.')
    }
  }
  fetchCompanies()
}, [])

// In JSX
{error && (
  <ErrorBanner 
    error={error} 
    onRetry={() => window.location.reload()}
    onDismiss={() => setError(null)}
  />
)}
```

### Loads Empty State (TO ADD)

```tsx
// After filtering
{filteredLoads.length === 0 && !loading && !error && (
  <EmptyState
    icon="📦"
    title="No loads found"
    description={activeFilters.length > 0 
      ? "Try adjusting your filters or check back later for new opportunities."
      : "No loads available at the moment. Check back soon!"}
    action={activeFilters.length > 0 ? {
      label: "Clear Filters",
      onClick: clearAllFilters
    } : undefined}
  />
)}
```

---

## 9. TOAST NOTIFICATIONS (FUTURE ENHANCEMENT)

For success messages and non-critical notifications, consider adding a toast system:

```tsx
// components/portal/Toast.tsx

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  onClose: () => void
}

export function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div className={`portal-toast portal-toast-${type}`}>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  )
}
```

**Use Cases:**
- ✅ "Vehicle added successfully"
- ✅ "Settings saved"
- ✅ "Bid placed successfully"
- ❌ Don't use for critical errors (use ErrorBanner instead)

---

## 10. TESTING CHECKLIST

### Empty States
- [ ] Display when data array is empty
- [ ] Display after filtering returns no results
- [ ] Include appropriate icon/emoji
- [ ] Include descriptive title and text
- [ ] Include CTA button when actionable
- [ ] Centered and well-spaced
- [ ] Not confused with loading state

### Error States
- [ ] Display when fetch fails
- [ ] Display user-friendly message (not technical error)
- [ ] Include retry button when applicable
- [ ] Include dismiss button when appropriate
- [ ] Colored appropriately (red/error theme)
- [ ] Not blocking (banner style, not modal)
- [ ] Console.error still logs for debugging

---

**Status:** Documentation Complete  
**Next Steps:** Implement missing error banners and empty states  
**Last Updated:** 2026-02-17
