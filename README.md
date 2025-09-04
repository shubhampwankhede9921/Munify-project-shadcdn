# Munify - Municipal Funding Platform

A modern, enterprise-grade municipal funding platform built with React, TypeScript, and shadcn/ui. Munify connects municipal commissioners with funders to enable transparent financing of municipal projects across India.

## 🏗️ Project Overview

Munify is India's first national municipal database and funding platform, designed to facilitate transparent information sharing, communication, and timely alerts among various stakeholders involved in municipal projects. The platform serves as a bridge between municipal commissioners (borrowers and grantees) and funders (lenders) without handling actual fund flows.

## ✨ Key Features

### 🏛️ Municipal Management
- **Credit Ratings & Analysis**: Comprehensive municipal credit scores and financial analysis
- **Financial Health Indicators**: Revenue trends, expenditure breakdown, debt ratios
- **Project Portfolio**: Track completed, ongoing, and planned municipal projects
- **Governance Scores**: Overall governance, infrastructure management, and financial management metrics

### 💰 Project Funding
- **Live Projects**: Real-time project tracking with funding progress
- **Project Details**: Comprehensive project information with financials, documents, media, and Q&A
- **Investment Tracking**: Portfolio management for individual investors
- **Favorites & Shortlisting**: Save and manage projects of interest

### 👥 User Management
- **Multi-Role Support**: Lenders, Municipal Commissioners, Consultants, and Administrators
- **Authentication**: Secure login and registration with social login options
- **User Dashboard**: Personalized views based on user roles

### 🔧 Admin Features
- **Project Management**: Add, update, and monitor all platform projects
- **User Management**: Manage platform users and roles
- **Notification System**: Send and manage notifications to users
- **Reports & Analytics**: Generate comprehensive platform reports

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing

### UI & Styling
- **shadcn/ui** - Modern, accessible component library
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons

### Form Management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation resolvers

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── app-sidebar.tsx  # Main navigation sidebar
│   ├── Copyright.tsx    # Copyright component with Dvara logo
│   └── index.ts         # Component exports
├── layouts/             # Layout components
│   └── AppLayout.tsx    # Main application layout
├── pages/               # Page components
│   ├── Landing.tsx      # Landing page
│   ├── Login.tsx        # Authentication pages
│   ├── Register.tsx     # User registration
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Projects*.tsx    # Project-related pages
│   ├── Municipal*.tsx   # Municipal management pages
│   ├── Admin*.tsx       # Admin management pages
│   └── index.ts         # Page exports
├── routes/              # Routing configuration
│   └── index.tsx        # React Router setup
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── assets/              # Static assets
│   └── logo-big.png     # Dvara Solutions logo
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd munify-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Slate tones for supporting elements
- **Accent**: Lime green for highlights and success states
- **Neutral**: Gray scale for text and backgrounds

### Components
Built with shadcn/ui components including:
- Buttons, Cards, Tables, Forms
- Navigation, Sidebar, Modals
- Progress indicators, Badges, Alerts
- Data visualization components

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### Protected Routes (`/main/*`)
- `/main` - Dashboard
- `/main/projects/*` - Project management
- `/main/municipal/*` - Municipal data and analysis
- `/main/admin/*` - Administrative functions
- `/main/settings` - User settings

## 🔐 Authentication

The platform supports multiple user roles:
- **Lenders/Investors**: Can browse and fund projects
- **Municipal Commissioners**: Can manage municipal projects
- **Consultants**: Can provide advisory services
- **Administrators**: Full platform management access

## 📊 Data Management

### Mock Data
Currently uses mock data for demonstration:
- Municipal financial data
- Project information and funding status
- User profiles and roles
- Notification templates

### Future Integration
Ready for integration with:
- REST APIs
- GraphQL endpoints
- Real-time data streams
- External municipal databases

## 🎯 Key Features Implementation

### Real-time Updates
- Project funding progress tracking
- Live notifications system
- Dynamic data updates

### Search & Filtering
- Global search across projects and municipalities
- Advanced filtering by category, status, location
- Real-time search results

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
