// XDrive Logistics Brand Palette
// Centralized color definitions to ensure consistency across the app
// IMPORTANT: This palette is for XDrive brand only - do NOT copy CX Fleet UI 1:1

export const brandColors = {
  // Primary Brand Colors
  primary: {
    navy: '#0A2239',      // XDrive Navy - Primary dark
    gold: '#D4AF37',      // XDrive Gold - Accent
    goldHover: '#c29d2f', // Gold hover state
  },
  
  // Backgrounds
  background: {
    light: '#f4f5f7',     // Light gray background
    white: '#ffffff',     // Pure white
    dark: '#0A2239',      // Navy background
  },
  
  // Text Colors
  text: {
    primary: '#0F172A',   // Primary text (dark gray)
    secondary: '#6b7280', // Secondary text (medium gray)
    light: '#9ca3af',     // Light gray text
    white: '#ffffff',     // White text
    gold: '#D4AF37',      // Gold text
  },
  
  // Borders
  border: {
    light: '#e5e7eb',     // Light border
    gold: 'rgba(212, 175, 55, 0.2)', // Gold border (translucent)
  },
  
  // Status Colors
  status: {
    success: '#16A34A',   // Green
    error: '#ef4444',     // Red
    warning: '#f59e0b',   // Orange
    info: '#3b82f6',      // Blue
  },
  
  // Overlays
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',      // Dark overlay
    darkLight: 'rgba(0, 0, 0, 0.3)', // Lighter dark overlay
  },
  
  // Mobile-specific (distinct from desktop)
  mobile: {
    navBackground: '#0A2239',         // Bottom nav background
    navActive: '#D4AF37',             // Active nav item
    navInactive: '#9ca3af',           // Inactive nav item
    cardBackground: '#ffffff',        // Card background
    cardBorder: '#e5e7eb',            // Card border
  },
} as const

// Export type for TypeScript autocomplete
export type BrandColors = typeof brandColors
