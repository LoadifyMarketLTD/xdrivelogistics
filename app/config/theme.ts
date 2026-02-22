export const THEME = {
  colors: {
    primary: {
      navyDark: '#0A2239',
      navy: '#1F3A5F',
      navyMid: '#274C77',
    },
    gold: {
      primary: '#D4AF37',
      dark: '#b8962e',
      light: '#e8c84e',
    },
    green: {
      primary: '#2E7D32',
      dark: '#1B5E20',
      light: '#4CAF50',
      pale: '#81C784',
    },
    text: {
      white: '#FFFFFF',
      whiteSubtle: 'rgba(255,255,255,0.75)',
      whiteMuted: 'rgba(255,255,255,0.5)',
      dark: '#0A2239',
      muted: '#64748b',
    },
    bg: {
      light: '#f8fafc',
      white: '#ffffff',
      dark: '#060f1a',
    },
    border: {
      light: '#e2e8f0',
      glass: 'rgba(255,255,255,0.1)',
      glassBright: 'rgba(255,255,255,0.2)',
    },
  },
  typography: {
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      hero: 'clamp(2.25rem, 5vw, 3.5rem)',
      section: 'clamp(1.75rem, 4vw, 2.5rem)',
    },
  },
  spacing: {
    sectionPadding: '5rem 0',
    containerPadding: '0 24px',
    containerMaxWidth: '1200px',
    cardPadding: '1.75rem',
    cardPaddingLg: '2rem',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '16px',
    '2xl': '20px',
    full: '100px',
    circle: '50%',
  },
  shadows: {
    card: '0 1px 4px rgba(0,0,0,0.06)',
    cardHover: '0 12px 40px rgba(0,0,0,0.1)',
    glass: '0 20px 60px rgba(0,0,0,0.3)',
    gold: '0 4px 20px rgba(212, 175, 55, 0.3)',
    green: '0 4px 20px rgba(46, 125, 50, 0.3)',
    navy: '0 8px 24px rgba(31,58,95,0.25)',
  },
  glass: {
    bg: 'rgba(255,255,255,0.07)',
    bgHover: 'rgba(255,255,255,0.11)',
    border: '1px solid rgba(255,255,255,0.1)',
    blur: 'blur(20px)',
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
    color: 'color 0.2s',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '900px',
    xl: '1200px',
    '2xl': '1400px',
  },
  gradients: {
    heroSection: 'linear-gradient(135deg, #1F3A5F 0%, #274C77 60%, #0A2239 100%)',
    darkSection: 'linear-gradient(135deg, #0A2239 0%, #1F3A5F 100%)',
    lightSection: 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)',
    progress: 'linear-gradient(90deg, #2E7D32, #4CAF50)',
  },
} as const;

export function glassStyle(hover = false) {
  return {
    backgroundColor: hover ? THEME.glass.bgHover : THEME.glass.bg,
    border: THEME.glass.border,
    backdropFilter: THEME.glass.blur,
  };
}

export function goldButton(hovered = false) {
  return {
    backgroundColor: hovered ? THEME.colors.gold.dark : THEME.colors.gold.primary,
    color: THEME.colors.primary.navyDark,
    fontWeight: THEME.typography.fontWeights.bold,
    borderRadius: THEME.borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    transition: THEME.transitions.default,
  };
}

export function greenButton(hovered = false) {
  return {
    backgroundColor: hovered ? THEME.colors.green.dark : THEME.colors.green.primary,
    color: THEME.colors.text.white,
    fontWeight: THEME.typography.fontWeights.bold,
    borderRadius: THEME.borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    transition: THEME.transitions.default,
    boxShadow: THEME.shadows.green,
  };
}

export function whatsappButton(hovered = false) {
  return greenButton(hovered);
}

export function darkGlassButton(hovered = false) {
  return {
    backgroundColor: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: THEME.colors.text.white,
    border: `2px solid ${hovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)'}`,
    borderRadius: THEME.borderRadius.lg,
    cursor: 'pointer',
    transition: THEME.transitions.default,
  };
}
