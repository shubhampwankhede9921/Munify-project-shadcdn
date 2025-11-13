# Munify - Municipal Funding Platform

A modern municipal funding platform built with React, TypeScript, and shadcn/ui. Munify connects municipal commissioners with funders to enable transparent financing of municipal projects.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation Steps

1. **Install dependencies**
   ```
   npm install
   ```

2. **Set up environment variables** (Optional)
   Create a `.env` file in the root directory with:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_PERDIX_JWT=your_jwt_token_here
   ```

3. **Start development server**
   ```
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📦 Technology Stack

### Core Framework
- **React 19** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 7** - Build tool and dev server

### UI & Styling
- **shadcn/ui** - Component library
- **Radix UI** - Accessible UI primitives
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Icon library

### State Management & Data
- **TanStack Query 5** - Server state management
- **TanStack Table 8** - Data table component
- **Axios 1.12** - HTTP client

### Forms & Validation
- **React Hook Form 7** - Form management
- **Zod 3** - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Routing
- **React Router DOM 7** - Client-side routing

### Utilities
- **SweetAlert2** - Alert dialogs
- **date-fns 4** - Date utilities
- **class-variance-authority** - Component variants
- **clsx & tailwind-merge** - CSS class utilities

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint** - TypeScript linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── data-table/   # Data table component
├── features/         # Feature-based modules
│   ├── admin/       # Admin pages
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # Dashboard
│   ├── master/      # Master data management
│   ├── municipalities/ # Municipal pages
│   ├── projects/    # Project pages
│   ├── settings/    # Settings pages
│   └── users/       # User management
├── layouts/         # Layout components
├── pages/           # Page components
├── routes/          # Route configuration
├── services/        # API services
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
└── assets/          # Static assets
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Application Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery

### Protected Routes (`/main/*`)
- `/main` - Dashboard
- `/main/projects/*` - Project management
- `/main/municipalities/*` - Municipal data
- `/main/master/*` - Master data management
- `/main/admin/*` - Administrative functions
- `/main/settings/:userId` - User settings

## 🔧 Configuration

### API Configuration
The application uses `apiService` from `@/services/api` for all API calls. The base URL is configured via `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:8000/api/v1`).

### Theme
The application supports light/dark themes with system preference detection.

## 📝 Development Guidelines

- Follow the patterns in `DEVELOPMENT_PROMPT.md` for consistency
- Use TypeScript for all new code
- Follow the feature-based folder structure
- Use shadcn/ui components exclusively
- Use TanStack Query for data fetching
- Use `alerts.success()` and `alerts.error()` for user feedback

## 📄 License

Private project - All rights reserved
