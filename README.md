# XDrive Logistics

A modern logistics and courier exchange platform built with React, TypeScript, and Supabase.

This is a hybrid application that uses **Vite** for the landing page and **Next.js** for the portal application.

## 🔧 Environment Variables

This project requires the following environment variables to be set. These values are **public** and safe to expose in client-side code:

### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://jqxlauexhkonixtjvljw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGxhdWV4aGtvbml4dGp2bGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTM2MzYsImV4cCI6MjA1NTI4OTYzNn0.yxmGBfB7tzCgBXi_6T-uJQ_JNNYmBVO
VITE_SITE_URL=http://localhost:5173
```

**For Production (Netlify):**
```bash
VITE_SITE_URL=https://xdrivelogistics.co.uk
```

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **The values are pre-configured** in `.env.example` - you can use them as-is for development

3. **For Netlify deployment:**
   - Add these environment variables in Netlify Dashboard → Site Settings → Environment Variables
   - Set them for ALL deploy contexts (Production, Deploy Previews, Branch deploys)
   - See `ENVIRONMENT_VARIABLES.md` for detailed deployment instructions

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite development server on `http://localhost:5173`

### Build

```bash
npm run build
```

This builds both the landing page (Vite) and portal (Next.js).

### Preview Production Build

```bash
npm run preview
```

## 📚 Documentation

- `ENVIRONMENT_VARIABLES.md` - Comprehensive environment setup guide
- `NETLIFY_SETUP.md` - Netlify deployment configuration
- `DATABASE_SETUP.md` - Database schema and migrations

## 🔌 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Portal:** Next.js 15
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Shadcn/ui

---

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
